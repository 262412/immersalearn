// ============================================
// Asset Agent — Finds 3D model URLs from
// Sketchfab's free model library.
// Searches by keyword, returns GLB download URL.
// Falls back gracefully if no API token or no match.
// ============================================

interface SketchfabResult {
  uid: string;
  name: string;
  viewerUrl: string;
  thumbnailUrl: string;
  isDownloadable: boolean;
  likeCount: number;
}

interface AssetSearchResult {
  model_url: string | null;
  source: string;
  name: string;
  thumbnail?: string;
}

// In-memory cache to avoid duplicate API calls
const searchCache = new Map<string, AssetSearchResult>();

/**
 * Search Sketchfab for a free 3D model matching the query.
 * Returns a download URL if SKETCHFAB_API_TOKEN is set, otherwise null.
 */
export async function findModelUrl(
  query: string,
  category?: string
): Promise<AssetSearchResult> {
  const cacheKey = `${query}_${category || ""}`.toLowerCase();
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  const token = process.env.SKETCHFAB_API_TOKEN;
  console.log(`[AssetAgent] Token: ${token ? token.slice(0, 8) + "..." : "NOT SET"}`);

  try {
    // Simplify search query: extract core nouns, drop adjectives
    const simplified = simplifyQuery(query);
    const searchQuery = category
      ? `${simplified} ${category}`
      : `${simplified} low poly`;

    console.log(`[AssetAgent] Searching: "${searchQuery}" (from "${query}")`);

    // Use relevance sort (not likeCount) to get actually relevant models
    // Add "low poly" to bias toward game-ready small assets
    const searchUrl = `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(searchQuery)}&downloadable=true&count=10&sort_by=-relevance&max_face_count=50000`;

    const searchRes = await fetch(searchUrl, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!searchRes.ok) {
      console.log(`[AssetAgent] Sketchfab search failed: ${searchRes.status}`);
      return cacheAndReturn(cacheKey, { model_url: null, source: "none", name: query });
    }

    const searchData = await searchRes.json();
    const results = (searchData.results || []) as any[];

    if (results.length === 0) {
      console.log(`[AssetAgent] No Sketchfab results for "${searchQuery}"`);
      return cacheAndReturn(cacheKey, { model_url: null, source: "none", name: query });
    }

    // Pick best result by relevance scoring (not just first)
    const best = pickBestResult(results, simplified);
    const thumbnail = best.thumbnails?.images?.[0]?.url;
    console.log(`[AssetAgent] Best match for "${simplified}": "${best.name}" (score: ${best._matchScore || 0})`)

    // If we have an API token, get the actual download URL
    if (token) {
      try {
        console.log(`[AssetAgent] Fetching download URL for "${best.name}" (${best.uid})...`);
        const downloadRes = await fetch(
          `https://api.sketchfab.com/v3/models/${best.uid}/download`,
          {
            headers: {
              "Authorization": `Token ${token}`,
              "Accept": "application/json",
            },
            signal: AbortSignal.timeout(10000),
          }
        );

        console.log(`[AssetAgent] Download response: ${downloadRes.status}`);

        if (downloadRes.ok) {
          const downloadData = await downloadRes.json();
          const glbUrl = downloadData.glb?.url || downloadData.gltf?.url;
          console.log(`[AssetAgent] GLB URL: ${glbUrl ? glbUrl.slice(0, 80) + "..." : "NOT FOUND"}`);
          if (glbUrl) {
            return cacheAndReturn(cacheKey, {
              model_url: glbUrl,
              source: "sketchfab",
              name: best.name,
              thumbnail,
            });
          }
        } else {
          const errBody = await downloadRes.text();
          console.log(`[AssetAgent] Download failed ${downloadRes.status}: ${errBody.slice(0, 200)}`);
        }
      } catch (e: any) {
        console.log(`[AssetAgent] Download URL fetch failed for ${best.uid}: ${e.message}`);
      }
    } else {
      console.log(`[AssetAgent] No SKETCHFAB_API_TOKEN — skipping download`);
    }

    // No token or download failed — return viewer URL as reference
    console.log(`[AssetAgent] Found "${best.name}" but no download token. Set SKETCHFAB_API_TOKEN for GLB downloads.`);
    return cacheAndReturn(cacheKey, {
      model_url: null,
      source: "sketchfab_no_token",
      name: best.name,
      thumbnail,
    });

  } catch (error: any) {
    console.log(`[AssetAgent] Search error: ${error.message}`);
    return cacheAndReturn(cacheKey, { model_url: null, source: "error", name: query });
  }
}

function cacheAndReturn(key: string, result: AssetSearchResult): AssetSearchResult {
  searchCache.set(key, result);
  return result;
}

/**
 * Enhance a SceneGraph by searching for models using WorldPlan's search_keywords.
 * Uses AI-generated keywords (not fantasy names) for accurate model matching.
 */
export async function enhanceSceneWithModels(
  sceneGraph: any,
  worldPlan?: any
): Promise<void> {
  const tasks: Promise<void>[] = [];

  // Build keyword lookup from WorldPlan
  const landmarkKeywords = new Map<string, string>();
  const npcKeywords = new Map<string, string>();
  const itemKeywords = new Map<string, string>();

  if (worldPlan?.narrative?.scenes) {
    for (const scene of worldPlan.narrative.scenes) {
      for (const lm of scene.world?.landmarks || []) {
        if (lm.search_keywords) landmarkKeywords.set(lm.id, lm.search_keywords);
      }
      for (const npc of scene.world?.npc_placements || []) {
        if (npc.search_keywords) npcKeywords.set(npc.character_id, npc.search_keywords);
      }
      for (const item of scene.world?.interactive_items || []) {
        if (item.search_keywords) itemKeywords.set(item.id, item.search_keywords);
      }
    }
    // Character-level keywords
    for (const char of worldPlan.narrative.characters || []) {
      if (char.search_keywords && !npcKeywords.has(char.id)) {
        npcKeywords.set(char.id, char.search_keywords);
      }
    }
  }

  // Enhance structures — use search_keywords from plan, fallback to simplified label
  for (const structure of sceneGraph.structures || []) {
    if (!structure.model_url) {
      const keywords = landmarkKeywords.get(structure.id) || simplifyQuery(structure.label || "");
      if (keywords) {
        tasks.push(
          findModelUrl(keywords, structure.type).then((result) => {
            if (result.model_url) structure.model_url = result.model_url;
          })
        );
      }
    }
  }

  // Enhance NPCs
  for (const npc of sceneGraph.npcs || []) {
    if (!npc.avatar?.model_url) {
      const keywords = npcKeywords.get(npc.character_ref) || npcKeywords.get(npc.id) || simplifyQuery(npc.name || "");
      if (keywords) {
        tasks.push(
          findModelUrl(keywords, "character").then((result) => {
            if (result.model_url) {
              if (!npc.avatar) npc.avatar = { model: "character_male", scale: 1 };
              npc.avatar.model_url = result.model_url;
            }
          })
        );
      }
    }
  }

  // Enhance interactive objects
  for (const obj of sceneGraph.interactive_objects || []) {
    if (!obj.model_url) {
      const keywords = itemKeywords.get(obj.id) || simplifyQuery(obj.name || "");
      if (keywords) {
        tasks.push(
          findModelUrl(keywords).then((result) => {
            if (result.model_url) {
              obj.model_url = result.model_url;
            }
          })
        );
      }
    }
  }

  // Run all searches in parallel (max ~15 concurrent)
  await Promise.allSettled(tasks);

  const modelsFound = [
    ...(sceneGraph.structures || []).filter((s: any) => s.model_url),
    ...(sceneGraph.npcs || []).filter((n: any) => n.avatar?.model_url),
    ...(sceneGraph.interactive_objects || []).filter((o: any) => o.model_url),
  ].length;

  console.log(`[AssetAgent] Enhanced scene: ${modelsFound} objects got model URLs`);
}

// ---- Result Ranking ----
// Score each Sketchfab result by how well its name matches the search query

function pickBestResult(results: any[], query: string): any {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  let bestScore = -1;
  let bestResult = results[0];

  for (const r of results) {
    const name = (r.name || "").toLowerCase();
    const tags = (r.tags || []).map((t: any) => t.name?.toLowerCase() || "");
    let score = 0;

    // Name word overlap
    for (const qw of queryWords) {
      if (name.includes(qw)) score += 3;
      if (tags.some((t: string) => t.includes(qw))) score += 2;
    }

    // Prefer smaller models (game-ready)
    const faces = r.faceCount || 100000;
    if (faces < 5000) score += 2;
    else if (faces < 20000) score += 1;

    // Prefer models with "low poly" in name/tags
    if (name.includes("low poly") || name.includes("lowpoly")) score += 2;
    if (tags.some((t: string) => t.includes("low") || t.includes("poly"))) score += 1;

    r._matchScore = score;

    if (score > bestScore) {
      bestScore = score;
      bestResult = r;
    }
  }

  return bestResult;
}

// ---- Query Simplification ----
// "Professor Paintbrush" → "paintbrush"
// "Warm Colour Garden" → "garden"
// "Artist's Brush Set" → "brush"
// "Van Gogh's Starry Night Replica" → "starry night painting"

const STOP_WORDS = new Set([
  "the", "a", "an", "of", "in", "on", "at", "to", "for", "and", "or",
  "is", "it", "its", "with", "from", "by", "as", "this", "that",
  // Adjectives that don't help 3D search
  "magic", "magical", "enchanted", "special", "ancient", "old", "new",
  "big", "small", "large", "tiny", "great", "grand", "mighty",
  "beautiful", "wonderful", "amazing", "mysterious", "warm", "cool",
  "primary", "secondary", "main", "mini", "super", "mega",
  "professor", "doctor", "mr", "mrs", "ms", "sir", "lady",
  // Possessives and articles
  "s",
]);

// Map fantasy/educational names to searchable 3D terms
const TERM_MAP: Record<string, string> = {
  "colour": "color",
  "colours": "colors",
  "mixing bowl": "bowl",
  "mixing station": "workbench",
  "colour pool": "pool water",
  "colour bottles": "bottles",
  "temperature thermometer": "thermometer",
  "gallery wall": "art gallery wall",
  "replica": "painting",
  "easel": "painting easel",
  "palette": "paint palette",
  "paintbrush": "paintbrush",
  "brush set": "paintbrush",
};

function simplifyQuery(raw: string): string {
  // Check term map first (exact or partial match)
  const lower = raw.toLowerCase();
  for (const [key, value] of Object.entries(TERM_MAP)) {
    if (lower.includes(key)) return value;
  }

  // Remove possessives, split into words, filter stop words
  const words = lower
    .replace(/['']s?\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  // Take last 1-2 meaningful words (usually the noun is at the end)
  // "Warm Colour Garden" → ["colour", "garden"] → "garden"
  // "Artist's Brush Set" → ["artist", "brush", "set"] → "brush set"
  if (words.length === 0) return raw.slice(0, 20);
  if (words.length <= 2) return words.join(" ");

  // Return last 2 words (most likely to be the core noun phrase)
  return words.slice(-2).join(" ");
}
