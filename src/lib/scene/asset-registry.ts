// ============================================
// Asset Registry — Stylized Low-Poly Assets
// Every entry has compound_parts for recognizable shapes.
// Builder Agent picks from these by asset_id.
// ============================================

export interface CompoundPart {
  primitive: "box" | "cylinder" | "sphere" | "cone";
  offset: [number, number, number];
  scale: [number, number, number];
  color: string;
}

export interface AssetEntry {
  id: string;
  name: string;
  category: "building" | "prop" | "character" | "environment" | "decoration" | "landmark" | "equipment";
  tags: string[];
  domain: string[];
  primitive_fallback: { type: "box" | "cylinder" | "sphere" | "cone"; scale: [number, number, number]; color: string };
  compound_parts: CompoundPart[];
  description: string;
}

export const ASSET_REGISTRY: AssetEntry[] = [

  // ================================================================
  //  NATURE — trees, rocks, water, flowers
  // ================================================================
  { id: "tree_oak", name: "Oak Tree", category: "decoration", tags: ["tree", "oak", "nature"], domain: ["universal"],
    primitive_fallback: { type: "cone", scale: [2, 4, 2], color: "#228B22" },
    compound_parts: [
      { primitive: "cylinder", offset: [0, 1, 0], scale: [0.4, 2, 0.4], color: "#5C3317" },
      { primitive: "sphere", offset: [0, 3, 0], scale: [2.5, 2, 2.5], color: "#2E8B57" },
      { primitive: "sphere", offset: [0.6, 3.5, 0.3], scale: [1.5, 1.5, 1.5], color: "#3CB371" },
      { primitive: "sphere", offset: [-0.5, 2.8, -0.4], scale: [1.8, 1.5, 1.8], color: "#228B22" },
    ], description: "A leafy oak tree" },

  { id: "tree_pine", name: "Pine Tree", category: "decoration", tags: ["tree", "pine", "evergreen"], domain: ["universal"],
    primitive_fallback: { type: "cone", scale: [1.5, 5, 1.5], color: "#1B5E20" },
    compound_parts: [
      { primitive: "cylinder", offset: [0, 0.8, 0], scale: [0.3, 1.6, 0.3], color: "#5C3317" },
      { primitive: "cone", offset: [0, 4, 0], scale: [0.8, 1.5, 0.8], color: "#1B5E20" },
      { primitive: "cone", offset: [0, 3, 0], scale: [1.2, 2, 1.2], color: "#2E7D32" },
      { primitive: "cone", offset: [0, 2, 0], scale: [1.6, 2, 1.6], color: "#388E3C" },
    ], description: "A tall pine tree" },

  { id: "bush", name: "Bush", category: "decoration", tags: ["bush", "shrub", "plant"], domain: ["universal"],
    primitive_fallback: { type: "sphere", scale: [1, 0.8, 1], color: "#2E8B57" },
    compound_parts: [
      { primitive: "sphere", offset: [0, 0.4, 0], scale: [1, 0.8, 1], color: "#2E8B57" },
      { primitive: "sphere", offset: [0.3, 0.5, 0.2], scale: [0.6, 0.5, 0.6], color: "#3CB371" },
    ], description: "A green bush" },

  { id: "rock", name: "Rock", category: "decoration", tags: ["rock", "stone", "boulder"], domain: ["universal"],
    primitive_fallback: { type: "sphere", scale: [1.5, 1, 1.5], color: "#808080" },
    compound_parts: [
      { primitive: "sphere", offset: [0, 0.4, 0], scale: [1.5, 1, 1.5], color: "#696969" },
      { primitive: "sphere", offset: [0.5, 0.2, 0.3], scale: [0.8, 0.6, 0.8], color: "#808080" },
    ], description: "A large rock" },

  { id: "flower_patch", name: "Flowers", category: "decoration", tags: ["flower", "garden"], domain: ["universal"],
    primitive_fallback: { type: "sphere", scale: [0.5, 0.5, 0.5], color: "#FF69B4" },
    compound_parts: [
      { primitive: "cylinder", offset: [0, 0.2, 0], scale: [0.05, 0.4, 0.05], color: "#228B22" },
      { primitive: "sphere", offset: [0, 0.45, 0], scale: [0.3, 0.2, 0.3], color: "#FF69B4" },
      { primitive: "cylinder", offset: [0.3, 0.15, 0.2], scale: [0.05, 0.3, 0.05], color: "#228B22" },
      { primitive: "sphere", offset: [0.3, 0.35, 0.2], scale: [0.25, 0.15, 0.25], color: "#FFD700" },
      { primitive: "cylinder", offset: [-0.2, 0.18, -0.1], scale: [0.05, 0.35, 0.05], color: "#228B22" },
      { primitive: "sphere", offset: [-0.2, 0.4, -0.1], scale: [0.28, 0.18, 0.28], color: "#FF4500" },
    ], description: "Colorful flowers" },

  { id: "pond", name: "Pond", category: "environment", tags: ["water", "pond", "lake"], domain: ["universal"],
    primitive_fallback: { type: "cylinder", scale: [4, 0.1, 4], color: "#4682B4" },
    compound_parts: [
      { primitive: "cylinder", offset: [0, 0.02, 0], scale: [4, 0.04, 4], color: "#4682B4" },
      { primitive: "cylinder", offset: [0, 0.01, 0], scale: [4.3, 0.02, 4.3], color: "#2F4F4F" },
    ], description: "A small pond" },

  // ================================================================
  //  BUILDINGS — houses, shops, temples, schools
  // ================================================================
  { id: "house_simple", name: "Simple House", category: "building", tags: ["house", "home", "building"], domain: ["universal"],
    primitive_fallback: { type: "box", scale: [4, 3, 3], color: "#DEB887" },
    compound_parts: [
      { primitive: "box", offset: [0, 1.25, 0], scale: [4, 2.5, 3], color: "#DEB887" },
      { primitive: "cone", offset: [0, 3, 0], scale: [4.5, 1.5, 3.5], color: "#8B4513" },
      { primitive: "box", offset: [0, 0.8, 1.45], scale: [0.8, 1.6, 0.1], color: "#654321" },
      { primitive: "box", offset: [-1, 1.5, 1.45], scale: [0.6, 0.6, 0.05], color: "#87CEEB" },
      { primitive: "box", offset: [1, 1.5, 1.45], scale: [0.6, 0.6, 0.05], color: "#87CEEB" },
    ], description: "A cozy house with roof and windows" },

  { id: "shop", name: "Shop", category: "building", tags: ["shop", "store", "market"], domain: ["universal"],
    primitive_fallback: { type: "box", scale: [5, 3, 4], color: "#A0522D" },
    compound_parts: [
      { primitive: "box", offset: [0, 1.25, 0], scale: [5, 2.5, 4], color: "#DEB887" },
      { primitive: "box", offset: [0, 2.8, 0], scale: [5.2, 0.3, 4.2], color: "#8B4513" },
      { primitive: "box", offset: [0, 3.1, 0], scale: [5.4, 0.15, 4.4], color: "#654321" },
      { primitive: "box", offset: [0, 0.8, 1.95], scale: [2, 1.6, 0.1], color: "#4682B4" },
      { primitive: "box", offset: [0, 2.3, 2.2], scale: [3, 0.5, 0.05], color: "#FFD700" },
    ], description: "A shop with awning" },

  { id: "school", name: "School Building", category: "building", tags: ["school", "education", "classroom"], domain: ["universal"],
    primitive_fallback: { type: "box", scale: [8, 4, 6], color: "#CD853F" },
    compound_parts: [
      { primitive: "box", offset: [0, 1.5, 0], scale: [8, 3, 6], color: "#CD853F" },
      { primitive: "box", offset: [0, 3.3, 0], scale: [8.2, 0.4, 6.2], color: "#8B6914" },
      { primitive: "box", offset: [0, 1.2, 2.95], scale: [1.5, 2.4, 0.1], color: "#654321" },
      { primitive: "box", offset: [-2.5, 1.8, 2.95], scale: [1, 1, 0.05], color: "#87CEEB" },
      { primitive: "box", offset: [2.5, 1.8, 2.95], scale: [1, 1, 0.05], color: "#87CEEB" },
      { primitive: "cylinder", offset: [0, 4.2, 0], scale: [0.15, 1.5, 0.15], color: "#808080" },
    ], description: "A school building with flag pole" },

  { id: "art_gallery", name: "Art Gallery", category: "building", tags: ["gallery", "museum", "art"], domain: ["art", "museum"],
    primitive_fallback: { type: "box", scale: [10, 5, 8], color: "#F5F5F5" },
    compound_parts: [
      { primitive: "box", offset: [0, 2, 0], scale: [10, 4, 8], color: "#F5F5F5" },
      { primitive: "box", offset: [0, 4.3, 0], scale: [10.5, 0.3, 8.5], color: "#D3D3D3" },
      { primitive: "cylinder", offset: [-4, 2, 3.95], scale: [0.3, 4, 0.3], color: "#E8E8E8" },
      { primitive: "cylinder", offset: [4, 2, 3.95], scale: [0.3, 4, 0.3], color: "#E8E8E8" },
      { primitive: "box", offset: [0, 1.5, 3.95], scale: [3, 3, 0.1], color: "#4682B4" },
    ], description: "A white art gallery with columns" },

  { id: "temple", name: "Temple", category: "landmark", tags: ["temple", "ancient", "columns"], domain: ["history", "ancient_greek", "ancient_roman"],
    primitive_fallback: { type: "box", scale: [8, 6, 6], color: "#F5F5DC" },
    compound_parts: [
      { primitive: "box", offset: [0, 0.3, 0], scale: [9, 0.6, 7], color: "#D2B48C" },
      { primitive: "cylinder", offset: [-3, 2.5, 2.5], scale: [0.4, 4, 0.4], color: "#F5F5DC" },
      { primitive: "cylinder", offset: [3, 2.5, 2.5], scale: [0.4, 4, 0.4], color: "#F5F5DC" },
      { primitive: "cylinder", offset: [-3, 2.5, -2.5], scale: [0.4, 4, 0.4], color: "#F5F5DC" },
      { primitive: "cylinder", offset: [3, 2.5, -2.5], scale: [0.4, 4, 0.4], color: "#F5F5DC" },
      { primitive: "cone", offset: [0, 5.2, 0], scale: [9.5, 2, 7.5], color: "#D2B48C" },
    ], description: "A classical temple with columns" },

  { id: "pyramid", name: "Pyramid", category: "landmark", tags: ["pyramid", "egypt", "ancient"], domain: ["history", "ancient_egyptian", "math"],
    primitive_fallback: { type: "cone", scale: [6, 6, 6], color: "#DAA520" },
    compound_parts: [
      { primitive: "cone", offset: [0, 3, 0], scale: [8, 6, 8], color: "#DAA520" },
      { primitive: "box", offset: [0, 0.05, 0], scale: [8.5, 0.1, 8.5], color: "#F4A460" },
    ], description: "An Egyptian pyramid" },

  { id: "castle", name: "Castle", category: "landmark", tags: ["castle", "medieval", "fortress"], domain: ["history", "medieval"],
    primitive_fallback: { type: "box", scale: [8, 6, 8], color: "#808080" },
    compound_parts: [
      { primitive: "box", offset: [0, 2.5, 0], scale: [6, 5, 6], color: "#808080" },
      { primitive: "cylinder", offset: [-3.5, 3.5, -3.5], scale: [1.2, 7, 1.2], color: "#696969" },
      { primitive: "cylinder", offset: [3.5, 3.5, -3.5], scale: [1.2, 7, 1.2], color: "#696969" },
      { primitive: "cylinder", offset: [-3.5, 3.5, 3.5], scale: [1.2, 7, 1.2], color: "#696969" },
      { primitive: "cylinder", offset: [3.5, 3.5, 3.5], scale: [1.2, 7, 1.2], color: "#696969" },
      { primitive: "cone", offset: [-3.5, 7.5, -3.5], scale: [1.5, 1.5, 1.5], color: "#8B0000" },
      { primitive: "cone", offset: [3.5, 7.5, -3.5], scale: [1.5, 1.5, 1.5], color: "#8B0000" },
      { primitive: "cone", offset: [-3.5, 7.5, 3.5], scale: [1.5, 1.5, 1.5], color: "#8B0000" },
      { primitive: "cone", offset: [3.5, 7.5, 3.5], scale: [1.5, 1.5, 1.5], color: "#8B0000" },
      { primitive: "box", offset: [0, 1.5, 3.05], scale: [1.5, 3, 0.1], color: "#654321" },
    ], description: "A medieval castle with towers" },

  { id: "tent", name: "Tent", category: "building", tags: ["tent", "camp", "outdoor"], domain: ["universal"],
    primitive_fallback: { type: "cone", scale: [3, 2.5, 3], color: "#D2B48C" },
    compound_parts: [
      { primitive: "cone", offset: [0, 1.5, 0], scale: [3.5, 3, 3.5], color: "#F5DEB3" },
      { primitive: "cylinder", offset: [0, 2.5, 0], scale: [0.08, 0.5, 0.08], color: "#8B6914" },
      { primitive: "box", offset: [0, 0.2, 1.6], scale: [1, 0.8, 0.05], color: "#8B6914" },
    ], description: "A camping tent" },

  // ================================================================
  //  FURNITURE & PROPS
  // ================================================================
  { id: "table", name: "Table", category: "prop", tags: ["table", "desk", "furniture"], domain: ["universal"],
    primitive_fallback: { type: "box", scale: [2, 0.8, 1], color: "#8B7355" },
    compound_parts: [
      { primitive: "box", offset: [0, 0.75, 0], scale: [2, 0.1, 1], color: "#8B7355" },
      { primitive: "cylinder", offset: [-0.8, 0.35, -0.35], scale: [0.08, 0.7, 0.08], color: "#6B4226" },
      { primitive: "cylinder", offset: [0.8, 0.35, -0.35], scale: [0.08, 0.7, 0.08], color: "#6B4226" },
      { primitive: "cylinder", offset: [-0.8, 0.35, 0.35], scale: [0.08, 0.7, 0.08], color: "#6B4226" },
      { primitive: "cylinder", offset: [0.8, 0.35, 0.35], scale: [0.08, 0.7, 0.08], color: "#6B4226" },
    ], description: "A wooden table" },

  { id: "chair", name: "Chair", category: "prop", tags: ["chair", "seat", "furniture"], domain: ["universal"],
    primitive_fallback: { type: "box", scale: [0.5, 0.9, 0.5], color: "#8B6914" },
    compound_parts: [
      { primitive: "box", offset: [0, 0.4, 0], scale: [0.5, 0.06, 0.5], color: "#8B6914" },
      { primitive: "box", offset: [0, 0.7, -0.22], scale: [0.5, 0.6, 0.06], color: "#8B6914" },
      { primitive: "cylinder", offset: [-0.2, 0.2, -0.2], scale: [0.04, 0.4, 0.04], color: "#6B4226" },
      { primitive: "cylinder", offset: [0.2, 0.2, -0.2], scale: [0.04, 0.4, 0.04], color: "#6B4226" },
      { primitive: "cylinder", offset: [-0.2, 0.2, 0.2], scale: [0.04, 0.4, 0.04], color: "#6B4226" },
      { primitive: "cylinder", offset: [0.2, 0.2, 0.2], scale: [0.04, 0.4, 0.04], color: "#6B4226" },
    ], description: "A wooden chair" },

  { id: "bookshelf", name: "Bookshelf", category: "prop", tags: ["shelf", "books", "library"], domain: ["universal"],
    primitive_fallback: { type: "box", scale: [2, 2.2, 0.5], color: "#6B4226" },
    compound_parts: [
      { primitive: "box", offset: [0, 1.1, 0], scale: [2, 2.2, 0.5], color: "#6B4226" },
      { primitive: "box", offset: [0, 1.8, 0.05], scale: [1.8, 0.25, 0.35], color: "#B22222" },
      { primitive: "box", offset: [0, 1.2, 0.05], scale: [1.8, 0.25, 0.35], color: "#4169E1" },
      { primitive: "box", offset: [0, 0.6, 0.05], scale: [1.8, 0.25, 0.35], color: "#228B22" },
    ], description: "A bookshelf with colorful books" },

  { id: "chest", name: "Treasure Chest", category: "prop", tags: ["chest", "treasure", "box"], domain: ["universal"],
    primitive_fallback: { type: "box", scale: [0.8, 0.6, 0.6], color: "#8B4513" },
    compound_parts: [
      { primitive: "box", offset: [0, 0.25, 0], scale: [0.8, 0.5, 0.6], color: "#8B4513" },
      { primitive: "cylinder", offset: [0, 0.55, 0], scale: [0.8, 0.3, 0.6], color: "#A0522D" },
      { primitive: "box", offset: [0, 0.3, 0], scale: [0.85, 0.06, 0.65], color: "#DAA520" },
    ], description: "A wooden treasure chest" },

  { id: "fence", name: "Fence", category: "decoration", tags: ["fence", "barrier", "wooden"], domain: ["universal"],
    primitive_fallback: { type: "box", scale: [4, 1, 0.1], color: "#DEB887" },
    compound_parts: [
      { primitive: "box", offset: [0, 0.5, 0], scale: [4, 0.1, 0.08], color: "#DEB887" },
      { primitive: "box", offset: [0, 0.2, 0], scale: [4, 0.1, 0.08], color: "#DEB887" },
      { primitive: "cylinder", offset: [-1.8, 0.4, 0], scale: [0.06, 0.8, 0.06], color: "#8B6914" },
      { primitive: "cylinder", offset: [-0.6, 0.4, 0], scale: [0.06, 0.8, 0.06], color: "#8B6914" },
      { primitive: "cylinder", offset: [0.6, 0.4, 0], scale: [0.06, 0.8, 0.06], color: "#8B6914" },
      { primitive: "cylinder", offset: [1.8, 0.4, 0], scale: [0.06, 0.8, 0.06], color: "#8B6914" },
    ], description: "A wooden fence" },

  { id: "lamp_post", name: "Lamp Post", category: "decoration", tags: ["lamp", "light", "street"], domain: ["universal"],
    primitive_fallback: { type: "cylinder", scale: [0.1, 3, 0.1], color: "#2F4F4F" },
    compound_parts: [
      { primitive: "cylinder", offset: [0, 1.5, 0], scale: [0.1, 3, 0.1], color: "#2F4F4F" },
      { primitive: "sphere", offset: [0, 3.2, 0], scale: [0.4, 0.4, 0.4], color: "#FFD700" },
      { primitive: "cylinder", offset: [0, 0.05, 0], scale: [0.3, 0.1, 0.3], color: "#2F4F4F" },
    ], description: "A street lamp post" },

  // ================================================================
  //  ART — easels, canvas, palette, instruments
  // ================================================================
  { id: "easel", name: "Painting Easel", category: "equipment", tags: ["easel", "painting", "canvas", "art"], domain: ["art"],
    primitive_fallback: { type: "box", scale: [0.8, 1.8, 0.6], color: "#D2B48C" },
    compound_parts: [
      { primitive: "cylinder", offset: [-0.2, 0.9, 0], scale: [0.05, 1.8, 0.05], color: "#8B6914" },
      { primitive: "cylinder", offset: [0.2, 0.9, 0], scale: [0.05, 1.8, 0.05], color: "#8B6914" },
      { primitive: "cylinder", offset: [0, 0.7, 0.3], scale: [0.05, 1.4, 0.05], color: "#8B6914" },
      { primitive: "box", offset: [0, 1.2, 0.02], scale: [0.7, 0.9, 0.03], color: "#FFFEF0" },
      { primitive: "box", offset: [0, 1.2, 0.04], scale: [0.75, 0.95, 0.02], color: "#DAA520" },
    ], description: "A painting easel with canvas" },

  { id: "palette", name: "Paint Palette", category: "prop", tags: ["palette", "paint", "art"], domain: ["art"],
    primitive_fallback: { type: "sphere", scale: [0.4, 0.05, 0.35], color: "#D2691E" },
    compound_parts: [
      { primitive: "cylinder", offset: [0, 0.02, 0], scale: [0.4, 0.04, 0.35], color: "#D2691E" },
      { primitive: "sphere", offset: [-0.1, 0.05, 0.1], scale: [0.08, 0.04, 0.08], color: "#FF0000" },
      { primitive: "sphere", offset: [0.05, 0.05, 0.12], scale: [0.08, 0.04, 0.08], color: "#0000FF" },
      { primitive: "sphere", offset: [0.15, 0.05, 0.05], scale: [0.08, 0.04, 0.08], color: "#FFD700" },
      { primitive: "sphere", offset: [-0.15, 0.05, -0.05], scale: [0.08, 0.04, 0.08], color: "#228B22" },
    ], description: "A paint palette with colors" },

  { id: "sculpture_pedestal", name: "Sculpture on Pedestal", category: "prop", tags: ["sculpture", "art", "statue"], domain: ["art", "museum"],
    primitive_fallback: { type: "cylinder", scale: [0.5, 1.5, 0.5], color: "#F5F5DC" },
    compound_parts: [
      { primitive: "box", offset: [0, 0.5, 0], scale: [0.7, 1, 0.7], color: "#F5F5F5" },
      { primitive: "sphere", offset: [0, 1.3, 0], scale: [0.4, 0.5, 0.35], color: "#F5F5DC" },
      { primitive: "cylinder", offset: [0, 1, 0], scale: [0.75, 0.06, 0.75], color: "#D3D3D3" },
    ], description: "A sculpture on a display pedestal" },

  { id: "piano", name: "Grand Piano", category: "prop", tags: ["piano", "music", "instrument"], domain: ["art", "music"],
    primitive_fallback: { type: "box", scale: [2, 1, 1.5], color: "#1C1C1C" },
    compound_parts: [
      { primitive: "box", offset: [0, 0.7, 0], scale: [1.8, 0.2, 1.3], color: "#1C1C1C" },
      { primitive: "box", offset: [-0.3, 0.85, 0.4], scale: [1, 0.08, 0.25], color: "#FFFEF0" },
      { primitive: "box", offset: [-0.3, 0.87, 0.45], scale: [0.8, 0.06, 0.1], color: "#1C1C1C" },
      { primitive: "cylinder", offset: [-0.7, 0.3, -0.5], scale: [0.08, 0.6, 0.08], color: "#1C1C1C" },
      { primitive: "cylinder", offset: [0.7, 0.3, -0.5], scale: [0.08, 0.6, 0.08], color: "#1C1C1C" },
      { primitive: "cylinder", offset: [0, 0.3, 0.5], scale: [0.08, 0.6, 0.08], color: "#1C1C1C" },
    ], description: "A grand piano" },

  // ================================================================
  //  SCIENCE & MATH
  // ================================================================
  { id: "lab_bench", name: "Lab Bench", category: "equipment", tags: ["lab", "bench", "science"], domain: ["science", "physics", "chemistry"],
    primitive_fallback: { type: "box", scale: [3, 0.9, 1], color: "#2F4F4F" },
    compound_parts: [
      { primitive: "box", offset: [0, 0.85, 0], scale: [3, 0.1, 1], color: "#2F4F4F" },
      { primitive: "box", offset: [-1.3, 0.4, 0], scale: [0.15, 0.8, 0.8], color: "#696969" },
      { primitive: "box", offset: [1.3, 0.4, 0], scale: [0.15, 0.8, 0.8], color: "#696969" },
      { primitive: "cylinder", offset: [-0.5, 1, 0.2], scale: [0.1, 0.2, 0.1], color: "#87CEEB" },
      { primitive: "cone", offset: [0.3, 1.1, 0.1], scale: [0.15, 0.25, 0.15], color: "#98FB98" },
    ], description: "A lab bench with beakers" },

  { id: "telescope", name: "Telescope", category: "equipment", tags: ["telescope", "astronomy", "space"], domain: ["science", "physics", "astronomy"],
    primitive_fallback: { type: "cylinder", scale: [0.15, 1.2, 0.15], color: "#B8860B" },
    compound_parts: [
      { primitive: "cylinder", offset: [0, 0.8, 0.3], scale: [0.12, 1, 0.12], color: "#B8860B" },
      { primitive: "cylinder", offset: [0, 0.5, 0], scale: [0.04, 1, 0.04], color: "#696969" },
      { primitive: "cylinder", offset: [-0.15, 0.02, -0.15], scale: [0.03, 0.04, 0.03], color: "#696969" },
      { primitive: "cylinder", offset: [0.15, 0.02, -0.15], scale: [0.03, 0.04, 0.03], color: "#696969" },
      { primitive: "cylinder", offset: [0, 0.02, 0.15], scale: [0.03, 0.04, 0.03], color: "#696969" },
    ], description: "A telescope on a tripod" },

  { id: "globe", name: "Globe", category: "prop", tags: ["globe", "earth", "geography"], domain: ["geography", "science"],
    primitive_fallback: { type: "sphere", scale: [0.8, 0.8, 0.8], color: "#4682B4" },
    compound_parts: [
      { primitive: "sphere", offset: [0, 0.8, 0], scale: [0.7, 0.7, 0.7], color: "#4682B4" },
      { primitive: "cylinder", offset: [0, 0.35, 0], scale: [0.04, 0.7, 0.04], color: "#B8860B" },
      { primitive: "cylinder", offset: [0, 0.05, 0], scale: [0.3, 0.1, 0.3], color: "#B8860B" },
    ], description: "A desktop globe" },

  { id: "chalkboard", name: "Chalkboard", category: "equipment", tags: ["chalkboard", "blackboard", "classroom"], domain: ["universal"],
    primitive_fallback: { type: "box", scale: [3, 2, 0.1], color: "#2F4F4F" },
    compound_parts: [
      { primitive: "box", offset: [0, 1.5, 0], scale: [3, 2, 0.08], color: "#2F4F4F" },
      { primitive: "box", offset: [0, 1.5, 0], scale: [3.2, 2.2, 0.05], color: "#8B6914" },
      { primitive: "box", offset: [0, 0.4, 0.1], scale: [1.5, 0.06, 0.1], color: "#8B6914" },
    ], description: "A green chalkboard with wooden frame" },

  { id: "planet", name: "Planet", category: "prop", tags: ["planet", "space", "astronomy"], domain: ["science", "astronomy"],
    primitive_fallback: { type: "sphere", scale: [2, 2, 2], color: "#4169E1" },
    compound_parts: [
      { primitive: "sphere", offset: [0, 0, 0], scale: [2, 2, 2], color: "#4169E1" },
      { primitive: "cylinder", offset: [0, 0, 0], scale: [3, 0.05, 3], color: "#DAA520" },
    ], description: "A planet with rings" },

  // ================================================================
  //  CHARACTERS — used by NPCEntities when asset_id is set
  // ================================================================
  { id: "character_friendly", name: "Friendly Guide", category: "character", tags: ["person", "guide", "friendly"], domain: ["universal"],
    primitive_fallback: { type: "cylinder", scale: [0.4, 1.7, 0.4], color: "#4682B4" },
    compound_parts: [
      { primitive: "sphere", offset: [0, 1.55, 0], scale: [0.35, 0.35, 0.35], color: "#FFDAB9" },
      { primitive: "box", offset: [0, 1, 0], scale: [0.5, 0.7, 0.3], color: "#4682B4" },
      { primitive: "box", offset: [0, 0.35, 0], scale: [0.25, 0.7, 0.25], color: "#2F4F4F" },
      { primitive: "cylinder", offset: [-0.35, 1, 0], scale: [0.08, 0.6, 0.08], color: "#4682B4" },
      { primitive: "cylinder", offset: [0.35, 1, 0], scale: [0.08, 0.6, 0.08], color: "#4682B4" },
      { primitive: "sphere", offset: [-0.35, 0.65, 0], scale: [0.1, 0.1, 0.1], color: "#FFDAB9" },
      { primitive: "sphere", offset: [0.35, 0.65, 0], scale: [0.1, 0.1, 0.1], color: "#FFDAB9" },
    ], description: "A friendly guide character" },

  { id: "character_artist", name: "Artist", category: "character", tags: ["artist", "painter", "creative"], domain: ["art"],
    primitive_fallback: { type: "cylinder", scale: [0.4, 1.7, 0.4], color: "#8B4513" },
    compound_parts: [
      { primitive: "sphere", offset: [0, 1.55, 0], scale: [0.35, 0.35, 0.35], color: "#FFDAB9" },
      { primitive: "cylinder", offset: [0, 1.75, 0], scale: [0.38, 0.08, 0.38], color: "#1C1C1C" },
      { primitive: "box", offset: [0, 1, 0], scale: [0.5, 0.7, 0.3], color: "#DEB887" },
      { primitive: "box", offset: [0, 0.35, 0], scale: [0.25, 0.7, 0.25], color: "#2F4F4F" },
      { primitive: "cylinder", offset: [-0.35, 1, 0], scale: [0.08, 0.6, 0.08], color: "#DEB887" },
      { primitive: "cylinder", offset: [0.35, 1, 0], scale: [0.08, 0.6, 0.08], color: "#DEB887" },
    ], description: "An artist wearing a beret" },

  { id: "character_scientist", name: "Scientist", category: "character", tags: ["scientist", "lab", "professor"], domain: ["science", "physics", "chemistry"],
    primitive_fallback: { type: "cylinder", scale: [0.4, 1.7, 0.4], color: "#F5F5F5" },
    compound_parts: [
      { primitive: "sphere", offset: [0, 1.55, 0], scale: [0.35, 0.35, 0.35], color: "#FFDAB9" },
      { primitive: "box", offset: [0, 1, 0], scale: [0.5, 0.7, 0.3], color: "#F5F5F5" },
      { primitive: "box", offset: [0, 0.35, 0], scale: [0.25, 0.7, 0.25], color: "#2F4F4F" },
      { primitive: "cylinder", offset: [-0.35, 1, 0], scale: [0.08, 0.6, 0.08], color: "#F5F5F5" },
      { primitive: "cylinder", offset: [0.35, 1, 0], scale: [0.08, 0.6, 0.08], color: "#F5F5F5" },
      { primitive: "cylinder", offset: [-0.12, 1.58, 0.18], scale: [0.12, 0.02, 0.05], color: "#87CEEB" },
      { primitive: "cylinder", offset: [0.12, 1.58, 0.18], scale: [0.12, 0.02, 0.05], color: "#87CEEB" },
    ], description: "A scientist in a lab coat with glasses" },

  { id: "character_cat", name: "Cartoon Cat", category: "character", tags: ["cat", "animal", "pet", "cartoon"], domain: ["universal"],
    primitive_fallback: { type: "sphere", scale: [0.5, 0.6, 0.4], color: "#FF8C00" },
    compound_parts: [
      { primitive: "sphere", offset: [0, 0.5, 0], scale: [0.5, 0.5, 0.4], color: "#FF8C00" },
      { primitive: "sphere", offset: [0, 0.9, 0], scale: [0.35, 0.3, 0.3], color: "#FF8C00" },
      { primitive: "cone", offset: [-0.12, 1.1, 0], scale: [0.08, 0.15, 0.06], color: "#FF8C00" },
      { primitive: "cone", offset: [0.12, 1.1, 0], scale: [0.08, 0.15, 0.06], color: "#FF8C00" },
      { primitive: "cylinder", offset: [0.3, 0.3, -0.15], scale: [0.15, 0.5, 0.1], color: "#FF8C00" },
    ], description: "A cute cartoon cat" },

  { id: "character_robot", name: "Friendly Robot", category: "character", tags: ["robot", "tech", "helper"], domain: ["science", "technology"],
    primitive_fallback: { type: "box", scale: [0.5, 1.2, 0.4], color: "#87CEEB" },
    compound_parts: [
      { primitive: "box", offset: [0, 1.3, 0], scale: [0.4, 0.4, 0.35], color: "#87CEEB" },
      { primitive: "sphere", offset: [-0.1, 1.35, 0.18], scale: [0.08, 0.08, 0.08], color: "#FFFF00" },
      { primitive: "sphere", offset: [0.1, 1.35, 0.18], scale: [0.08, 0.08, 0.08], color: "#FFFF00" },
      { primitive: "box", offset: [0, 0.8, 0], scale: [0.5, 0.6, 0.35], color: "#B0C4DE" },
      { primitive: "box", offset: [0, 0.3, 0], scale: [0.2, 0.4, 0.2], color: "#778899" },
      { primitive: "cylinder", offset: [-0.35, 0.85, 0], scale: [0.08, 0.5, 0.08], color: "#778899" },
      { primitive: "cylinder", offset: [0.35, 0.85, 0], scale: [0.08, 0.5, 0.08], color: "#778899" },
      { primitive: "cylinder", offset: [0, 1.55, 0], scale: [0.03, 0.15, 0.03], color: "#FF0000" },
    ], description: "A friendly robot helper with antenna" },

  // ================================================================
  //  HISTORY — specific items
  // ================================================================
  { id: "scroll", name: "Scroll", category: "prop", tags: ["scroll", "ancient", "document"], domain: ["history"],
    primitive_fallback: { type: "cylinder", scale: [0.1, 0.4, 0.1], color: "#F5DEB3" },
    compound_parts: [
      { primitive: "cylinder", offset: [0, 0.2, 0], scale: [0.05, 0.3, 0.05], color: "#F5DEB3" },
      { primitive: "cylinder", offset: [0, 0.35, 0], scale: [0.07, 0.02, 0.07], color: "#8B6914" },
      { primitive: "cylinder", offset: [0, 0.05, 0], scale: [0.07, 0.02, 0.07], color: "#8B6914" },
    ], description: "An ancient scroll" },

  { id: "torch", name: "Wall Torch", category: "decoration", tags: ["torch", "fire", "light"], domain: ["history", "medieval"],
    primitive_fallback: { type: "cylinder", scale: [0.1, 0.6, 0.1], color: "#FF8C00" },
    compound_parts: [
      { primitive: "cylinder", offset: [0, 0.3, 0], scale: [0.06, 0.5, 0.06], color: "#8B6914" },
      { primitive: "cone", offset: [0, 0.6, 0], scale: [0.12, 0.2, 0.12], color: "#FF4500" },
      { primitive: "sphere", offset: [0, 0.7, 0], scale: [0.08, 0.1, 0.08], color: "#FFD700" },
    ], description: "A burning wall torch" },

  { id: "well", name: "Stone Well", category: "prop", tags: ["well", "water", "stone"], domain: ["history", "universal"],
    primitive_fallback: { type: "cylinder", scale: [1, 1, 1], color: "#696969" },
    compound_parts: [
      { primitive: "cylinder", offset: [0, 0.4, 0], scale: [1, 0.8, 1], color: "#808080" },
      { primitive: "cylinder", offset: [0, 0.02, 0], scale: [0.8, 0.04, 0.8], color: "#4682B4" },
      { primitive: "cylinder", offset: [-0.5, 1.2, 0], scale: [0.06, 1.2, 0.06], color: "#8B6914" },
      { primitive: "cylinder", offset: [0.5, 1.2, 0], scale: [0.06, 1.2, 0.06], color: "#8B6914" },
      { primitive: "cylinder", offset: [0, 1.8, 0], scale: [0.5, 0.04, 0.04], color: "#8B6914" },
    ], description: "A stone well with frame" },

  { id: "camel", name: "Camel", category: "prop", tags: ["camel", "desert", "animal"], domain: ["history", "geography"],
    primitive_fallback: { type: "box", scale: [1.5, 1.5, 0.6], color: "#C4A882" },
    compound_parts: [
      { primitive: "box", offset: [0, 0.8, 0], scale: [1.5, 0.7, 0.6], color: "#C4A882" },
      { primitive: "sphere", offset: [0.2, 1.2, 0], scale: [0.3, 0.3, 0.25], color: "#C4A882" },
      { primitive: "cylinder", offset: [0.8, 1.2, 0], scale: [0.12, 0.5, 0.1], color: "#C4A882" },
      { primitive: "sphere", offset: [0.9, 1.5, 0], scale: [0.18, 0.15, 0.12], color: "#C4A882" },
      { primitive: "cylinder", offset: [-0.5, 0.3, -0.15], scale: [0.06, 0.6, 0.06], color: "#B8A07A" },
      { primitive: "cylinder", offset: [-0.5, 0.3, 0.15], scale: [0.06, 0.6, 0.06], color: "#B8A07A" },
      { primitive: "cylinder", offset: [0.4, 0.3, -0.15], scale: [0.06, 0.6, 0.06], color: "#B8A07A" },
      { primitive: "cylinder", offset: [0.4, 0.3, 0.15], scale: [0.06, 0.6, 0.06], color: "#B8A07A" },
    ], description: "A camel" },

  // ================================================================
  //  INTERACTIVE ITEMS — objects kids click on
  // ================================================================
  { id: "book", name: "Book", category: "prop", tags: ["book", "reading", "knowledge"], domain: ["universal"],
    primitive_fallback: { type: "box", scale: [0.3, 0.05, 0.25], color: "#8B0000" },
    compound_parts: [
      { primitive: "box", offset: [0, 0.03, 0], scale: [0.3, 0.05, 0.25], color: "#8B0000" },
      { primitive: "box", offset: [0, 0.03, 0], scale: [0.28, 0.04, 0.23], color: "#FFFEF0" },
    ], description: "A colorful book" },

  { id: "paintbrush", name: "Paintbrush", category: "prop", tags: ["paintbrush", "art", "tool"], domain: ["art"],
    primitive_fallback: { type: "cylinder", scale: [0.04, 0.4, 0.04], color: "#8B6914" },
    compound_parts: [
      { primitive: "cylinder", offset: [0, 0.15, 0], scale: [0.03, 0.25, 0.03], color: "#DEB887" },
      { primitive: "cylinder", offset: [0, 0.3, 0], scale: [0.04, 0.05, 0.04], color: "#C0C0C0" },
      { primitive: "cone", offset: [0, 0.37, 0], scale: [0.04, 0.1, 0.02], color: "#4169E1" },
    ], description: "A paintbrush with blue tip" },

  { id: "magnifying_glass", name: "Magnifying Glass", category: "prop", tags: ["magnifying", "search", "explore"], domain: ["science", "universal"],
    primitive_fallback: { type: "sphere", scale: [0.3, 0.3, 0.05], color: "#87CEEB" },
    compound_parts: [
      { primitive: "cylinder", offset: [0, 0.25, 0], scale: [0.3, 0.03, 0.3], color: "#B8860B" },
      { primitive: "cylinder", offset: [0, 0.25, 0], scale: [0.25, 0.02, 0.25], color: "#E0FFFF" },
      { primitive: "cylinder", offset: [0, 0.05, 0.2], scale: [0.04, 0.15, 0.04], color: "#8B6914" },
    ], description: "A magnifying glass" },

  { id: "star_collectible", name: "Star", category: "prop", tags: ["star", "reward", "collectible"], domain: ["universal"],
    primitive_fallback: { type: "sphere", scale: [0.3, 0.3, 0.3], color: "#FFD700" },
    compound_parts: [
      { primitive: "sphere", offset: [0, 0, 0], scale: [0.3, 0.3, 0.1], color: "#FFD700" },
      { primitive: "sphere", offset: [0, 0, 0], scale: [0.1, 0.3, 0.3], color: "#FFD700" },
    ], description: "A golden collectible star" },
];

// ---- Helper: find asset by ID ----
export function findAssetById(id: string): AssetEntry | undefined {
  return ASSET_REGISTRY.find((a) => a.id === id);
}

// ---- Helper: find best matching asset by query ----
export function findAsset(query: string, domain?: string, category?: string): AssetEntry | null {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  let bestMatch: AssetEntry | null = null;
  let bestScore = 0;

  for (const asset of ASSET_REGISTRY) {
    let score = 0;
    for (const tag of asset.tags) {
      if (queryWords.some((w) => tag.includes(w) || w.includes(tag))) score += 2;
    }
    const nameLower = asset.name.toLowerCase();
    if (queryLower.includes(nameLower) || nameLower.includes(queryLower)) score += 5;
    if (domain && asset.domain.some((d) => d === domain || d === "universal")) score += 1;
    if (category && asset.category === category) score += 1;
    if (score > bestScore) { bestScore = score; bestMatch = asset; }
  }

  return bestScore > 0 ? bestMatch : null;
}

// ---- Helper: get assets filtered by domain ----
export function getAssetsForDomain(domain: string): AssetEntry[] {
  return ASSET_REGISTRY.filter(
    (a) => a.domain.includes(domain) || a.domain.includes("universal")
  );
}
