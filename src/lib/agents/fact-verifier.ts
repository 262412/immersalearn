// ============================================
// Fact Verification Pipeline
// Layer 2 of anti-hallucination system
// Cross-checks script claims against KnowledgeGraph
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import type {
  KnowledgeGraph,
  Script,
  VerificationReport,
  VerificationItem,
} from "@/lib/types";

const VERIFICATION_PROMPT = `You are a rigorous fact-checker for educational content. Your job is to verify every factual claim in an educational script against a source knowledge graph.

## Rules
1. A claim is "verified" if it directly matches or is clearly supported by a fact in the knowledge graph
2. A claim is "flagged" if it's partially supported but contains embellishment or interpretation beyond the source
3. A claim is "rejected" if it contradicts the knowledge graph or has no source support at all
4. Fictional elements (character names, dialogue flavor) are NOT factual claims — skip them
5. Focus on: dates, names, places, cause-effect relationships, statistics, historical processes

## Output Format
Return a JSON array of verification items, each with:
- claim: the factual claim being checked
- scene_id: where it appears
- interaction_id: which interaction
- source_fact_id: the matching fact ID (or null)
- status: "verified" | "flagged" | "rejected"
- reason: brief explanation
- suggested_correction: (only if flagged/rejected) what should be said instead`;

export async function verifyScript(
  script: Script,
  knowledgeGraph: KnowledgeGraph
): Promise<VerificationReport> {
  // Step 1: Collect all factual claims from the script
  const claims = collectClaims(script);

  if (claims.length === 0) {
    return {
      script_id: script.id,
      total_claims: 0,
      verified: 0,
      flagged: 0,
      rejected: 0,
      items: [],
    };
  }

  // Step 2: Automated cross-reference check (fast, no API call)
  const autoVerified = autoVerifyClaims(claims, knowledgeGraph);

  // Step 3: AI-powered verification for unmatched claims
  const needsAiCheck = autoVerified.filter((c) => c.status === "flagged");

  let aiVerified: VerificationItem[] = [];
  if (needsAiCheck.length > 0) {
    aiVerified = await aiVerifyClaims(needsAiCheck, knowledgeGraph);
  }

  // Merge results
  const allItems = autoVerified.map((item) => {
    const aiResult = aiVerified.find(
      (ai) => ai.claim === item.claim && ai.interaction_id === item.interaction_id
    );
    return aiResult || item;
  });

  const verified = allItems.filter((i) => i.status === "verified").length;
  const flagged = allItems.filter((i) => i.status === "flagged").length;
  const rejected = allItems.filter((i) => i.status === "rejected").length;

  return {
    script_id: script.id,
    total_claims: allItems.length,
    verified,
    flagged,
    rejected,
    items: allItems,
  };
}

// ---- Collect all factual claims from script ----
interface RawClaim {
  claim: string;
  scene_id: string;
  interaction_id: string;
  source_fact_id?: string;
}

function collectClaims(script: Script): RawClaim[] {
  const claims: RawClaim[] = [];

  for (const act of script.acts) {
    for (const scene of act.scenes) {
      for (const interaction of scene.interactions) {
        if (interaction.factual_claims) {
          for (const fc of interaction.factual_claims) {
            claims.push({
              claim: fc.claim,
              scene_id: scene.id,
              interaction_id: interaction.id,
              source_fact_id: fc.source_fact_id,
            });
          }
        }
      }
    }
  }

  return claims;
}

// ---- Auto-verify against knowledge graph (exact/fuzzy match) ----
function autoVerifyClaims(
  claims: RawClaim[],
  kg: KnowledgeGraph
): VerificationItem[] {
  const factMap = new Map(kg.facts.map((f) => [f.id, f]));

  return claims.map((claim) => {
    // If the claim references a specific fact ID, check it exists
    if (claim.source_fact_id && factMap.has(claim.source_fact_id)) {
      const fact = factMap.get(claim.source_fact_id)!;
      // Simple check: does the claim text relate to the fact?
      const claimLower = claim.claim.toLowerCase();
      const factLower = fact.statement.toLowerCase();

      // Check for keyword overlap
      const factWords = factLower.split(/\s+/).filter((w) => w.length > 3);
      const matchCount = factWords.filter((w) => claimLower.includes(w)).length;
      const matchRatio = factWords.length > 0 ? matchCount / factWords.length : 0;

      if (matchRatio > 0.3) {
        return {
          claim: claim.claim,
          scene_id: claim.scene_id,
          interaction_id: claim.interaction_id,
          source_fact_id: claim.source_fact_id,
          status: "verified" as const,
          reason: `Matches source fact: "${fact.statement}"`,
        };
      }
    }

    // No direct match found — flag for AI review
    return {
      claim: claim.claim,
      scene_id: claim.scene_id,
      interaction_id: claim.interaction_id,
      source_fact_id: claim.source_fact_id,
      status: "flagged" as const,
      reason: "No direct match in knowledge graph — needs AI verification",
    };
  });
}

// ---- AI-powered verification for uncertain claims ----
async function aiVerifyClaims(
  items: VerificationItem[],
  kg: KnowledgeGraph
): Promise<VerificationItem[]> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4000,
    system: VERIFICATION_PROMPT,
    messages: [
      {
        role: "user",
        content: `## Knowledge Graph Facts
${JSON.stringify(kg.facts, null, 2)}

## Claims to Verify
${JSON.stringify(
  items.map((i) => ({
    claim: i.claim,
    scene_id: i.scene_id,
    interaction_id: i.interaction_id,
  })),
  null,
  2
)}

Verify each claim against the knowledge graph facts. Return a JSON array.`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\[[\s\S]*\])/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
  } catch {
    // If AI verification fails, keep items as flagged
  }

  return items;
}
