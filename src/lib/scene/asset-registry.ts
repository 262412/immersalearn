// ============================================
// Asset Registry — Multi-Subject
// Maps semantic descriptions to 3D primitives
// domain: subject/era tags for matching
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
  file?: string;
  primitive_fallback: {
    type: "box" | "cylinder" | "sphere" | "cone";
    scale: [number, number, number];
    color: string;
  };
  compound_parts?: CompoundPart[]; // multi-primitive composition for richer visuals
  description: string;
}

export const ASSET_REGISTRY: AssetEntry[] = [

  // ================================================================
  //  UNIVERSAL — shared across all subjects
  // ================================================================
  { id: "wooden_table", name: "Wooden Table", category: "prop", tags: ["table", "furniture", "wood", "desk"], domain: ["universal"], primitive_fallback: { type: "box", scale: [2, 0.8, 1], color: "#8B7355" }, description: "A sturdy wooden table" },
  { id: "wooden_chair", name: "Wooden Chair", category: "prop", tags: ["chair", "furniture", "seat"], domain: ["universal"], primitive_fallback: { type: "box", scale: [0.5, 0.9, 0.5], color: "#8B6914" }, description: "A simple wooden chair" },
  { id: "bookshelf", name: "Bookshelf", category: "prop", tags: ["shelf", "books", "library", "storage"], domain: ["universal"], primitive_fallback: { type: "box", scale: [2, 2.2, 0.5], color: "#6B4226" }, description: "A tall bookshelf filled with books" },
  { id: "book_open", name: "Open Book", category: "prop", tags: ["book", "reading", "text", "knowledge"], domain: ["universal"], primitive_fallback: { type: "box", scale: [0.4, 0.05, 0.3], color: "#F5F5DC" }, description: "An open book" },
  { id: "scroll", name: "Scroll", category: "prop", tags: ["scroll", "document", "paper", "ancient"], domain: ["universal"], primitive_fallback: { type: "cylinder", scale: [0.1, 0.4, 0.1], color: "#F5DEB3" }, description: "A rolled-up scroll" },
  { id: "chest_wooden", name: "Wooden Chest", category: "prop", tags: ["chest", "storage", "treasure", "box"], domain: ["universal"], primitive_fallback: { type: "box", scale: [0.8, 0.6, 0.6], color: "#8B4513" }, description: "A wooden storage chest" },
  { id: "torch_wall", name: "Wall Torch", category: "decoration", tags: ["torch", "fire", "light", "medieval"], domain: ["universal"], primitive_fallback: { type: "cylinder", scale: [0.1, 0.6, 0.1], color: "#FF8C00" }, description: "A wall-mounted torch with flame" },
  { id: "lamp_oil", name: "Oil Lamp", category: "prop", tags: ["lamp", "light", "oil"], domain: ["universal"], primitive_fallback: { type: "sphere", scale: [0.2, 0.25, 0.2], color: "#FFD700" }, description: "A small oil lamp" },
  { id: "barrel", name: "Barrel", category: "prop", tags: ["barrel", "storage", "trade"], domain: ["universal"], primitive_fallback: { type: "cylinder", scale: [0.5, 0.7, 0.5], color: "#8B6914" }, description: "A wooden barrel" },
  { id: "crate", name: "Wooden Crate", category: "prop", tags: ["crate", "box", "storage"], domain: ["universal"], primitive_fallback: { type: "box", scale: [0.8, 0.8, 0.8], color: "#A0522D" }, description: "A wooden crate" },
  { id: "signpost", name: "Signpost", category: "prop", tags: ["sign", "direction", "post", "guide"], domain: ["universal"], primitive_fallback: { type: "cylinder", scale: [0.1, 2.5, 0.1], color: "#8B6914" }, description: "A wooden signpost" },
  { id: "flag_banner", name: "Banner Flag", category: "decoration", tags: ["flag", "banner", "cloth"], domain: ["universal"], primitive_fallback: { type: "box", scale: [1, 1.5, 0.05], color: "#B22222" }, description: "A hanging cloth banner" },

  // ---- Universal Characters ----
  { id: "character_male", name: "Male Character", category: "character", tags: ["male", "person", "man", "human"], domain: ["universal"], primitive_fallback: { type: "cylinder", scale: [0.4, 1.7, 0.4], color: "#4682B4" }, description: "A generic male character" },
  { id: "character_female", name: "Female Character", category: "character", tags: ["female", "person", "woman", "human"], domain: ["universal"], primitive_fallback: { type: "cylinder", scale: [0.35, 1.65, 0.35], color: "#DA70D6" }, description: "A generic female character" },
  { id: "character_elder", name: "Elder / Mentor", category: "character", tags: ["elder", "old", "wise", "mentor", "teacher", "professor"], domain: ["universal"], primitive_fallback: { type: "cylinder", scale: [0.4, 1.6, 0.4], color: "#C0C0C0" }, description: "An elderly mentor or teacher figure" },
  { id: "character_child", name: "Child Character", category: "character", tags: ["child", "kid", "student", "young"], domain: ["universal"], primitive_fallback: { type: "cylinder", scale: [0.3, 1.2, 0.3], color: "#87CEEB" }, description: "A child or young student" },

  // ---- Universal Nature ----
  { id: "tree_generic", name: "Tree", category: "decoration", tags: ["tree", "nature", "plant", "vegetation"], domain: ["universal"], primitive_fallback: { type: "cone", scale: [1.5, 4, 1.5], color: "#228B22" }, compound_parts: [
    { primitive: "cylinder", offset: [0, 0.8, 0], scale: [0.3, 1.6, 0.3], color: "#6B3A2A" },
    { primitive: "cone", offset: [0, 2.8, 0], scale: [1.5, 2.5, 1.5], color: "#228B22" },
    { primitive: "cone", offset: [0, 3.8, 0], scale: [1.0, 1.5, 1.0], color: "#2E8B57" },
  ], description: "A generic green tree" },
  { id: "rock_large", name: "Large Rock", category: "decoration", tags: ["rock", "stone", "boulder"], domain: ["universal"], primitive_fallback: { type: "sphere", scale: [2, 1.5, 2], color: "#808080" }, description: "A large boulder" },
  { id: "bush", name: "Bush", category: "decoration", tags: ["bush", "shrub", "plant", "vegetation"], domain: ["universal"], primitive_fallback: { type: "sphere", scale: [1, 0.8, 1], color: "#2E8B57" }, description: "A green bush" },
  { id: "flower_patch", name: "Flower Patch", category: "decoration", tags: ["flower", "garden", "plant", "nature"], domain: ["universal"], primitive_fallback: { type: "sphere", scale: [0.8, 0.4, 0.8], color: "#FF69B4" }, description: "A patch of colorful flowers" },
  { id: "water_pond", name: "Pond", category: "environment", tags: ["water", "pond", "lake"], domain: ["universal"], primitive_fallback: { type: "cylinder", scale: [4, 0.1, 4], color: "#4682B4" }, description: "A small pond of still water" },

  // ================================================================
  //  ART — studios, galleries, instruments, materials
  // ================================================================

  // -- Spaces --
  { id: "art_studio", name: "Art Studio", category: "building", tags: ["studio", "art", "atelier", "workshop"], domain: ["art", "renaissance", "modern_art"], primitive_fallback: { type: "box", scale: [10, 5, 8], color: "#F5F5DC" }, description: "A bright art studio with high ceilings and large windows" },
  { id: "art_gallery_wall", name: "Gallery Wall", category: "building", tags: ["gallery", "wall", "exhibition", "museum"], domain: ["art", "museum"], primitive_fallback: { type: "box", scale: [8, 4, 0.3], color: "#FAFAFA" }, description: "A tall white gallery wall for hanging artworks" },
  { id: "art_museum_hall", name: "Museum Hall", category: "building", tags: ["museum", "hall", "gallery", "exhibition"], domain: ["art", "history", "museum"], primitive_fallback: { type: "box", scale: [15, 6, 12], color: "#F0EDE4" }, description: "A grand museum exhibition hall with marble floors" },
  { id: "art_pedestal", name: "Display Pedestal", category: "prop", tags: ["pedestal", "display", "stand", "sculpture", "museum"], domain: ["art", "museum"], primitive_fallback: { type: "cylinder", scale: [0.5, 1.2, 0.5], color: "#F5F5F5" }, description: "A white pedestal for displaying sculptures" },

  // -- Art Tools & Materials --
  { id: "easel", name: "Painting Easel", category: "equipment", tags: ["easel", "painting", "canvas", "art"], domain: ["art", "renaissance"], primitive_fallback: { type: "box", scale: [0.8, 1.8, 0.6], color: "#D2B48C" }, compound_parts: [
    { primitive: "cylinder", offset: [-0.2, 0.9, 0], scale: [0.05, 1.8, 0.05], color: "#8B6914" },
    { primitive: "cylinder", offset: [0.2, 0.9, 0], scale: [0.05, 1.8, 0.05], color: "#8B6914" },
    { primitive: "cylinder", offset: [0, 0.7, 0.3], scale: [0.05, 1.4, 0.05], color: "#8B6914" },
    { primitive: "box", offset: [0, 1.2, 0.02], scale: [0.7, 0.9, 0.03], color: "#FFFEF0" },
  ], description: "A wooden painting easel holding a canvas" },
  { id: "canvas_blank", name: "Blank Canvas", category: "prop", tags: ["canvas", "painting", "blank", "art"], domain: ["art"], primitive_fallback: { type: "box", scale: [0.8, 1, 0.05], color: "#FFFEF0" }, description: "A blank stretched canvas" },
  { id: "canvas_painting", name: "Framed Painting", category: "prop", tags: ["painting", "frame", "artwork", "masterpiece"], domain: ["art", "renaissance", "museum"], primitive_fallback: { type: "box", scale: [1.2, 0.9, 0.08], color: "#DAA520" }, description: "A framed painting on canvas" },
  { id: "palette", name: "Paint Palette", category: "prop", tags: ["palette", "paint", "colors", "art", "brush"], domain: ["art"], primitive_fallback: { type: "sphere", scale: [0.35, 0.05, 0.3], color: "#D2691E" }, description: "An artist's paint palette with mixed colors" },
  { id: "paint_tubes", name: "Paint Tubes", category: "prop", tags: ["paint", "tube", "oil", "acrylic", "art"], domain: ["art"], primitive_fallback: { type: "cylinder", scale: [0.05, 0.15, 0.05], color: "#4169E1" }, description: "Tubes of paint in various colors" },
  { id: "sculpture_abstract", name: "Abstract Sculpture", category: "prop", tags: ["sculpture", "abstract", "art", "modern", "statue"], domain: ["art", "modern_art"], primitive_fallback: { type: "cone", scale: [0.6, 1.5, 0.6], color: "#708090" }, description: "An abstract modern sculpture" },
  { id: "sculpture_bust", name: "Bust Sculpture", category: "prop", tags: ["bust", "sculpture", "head", "classical", "art"], domain: ["art", "ancient_greek", "ancient_roman", "renaissance"], primitive_fallback: { type: "sphere", scale: [0.4, 0.5, 0.35], color: "#F5F5DC" }, description: "A classical bust sculpture in marble" },
  { id: "chisel_hammer", name: "Chisel & Hammer", category: "prop", tags: ["chisel", "hammer", "sculpting", "carving", "art"], domain: ["art", "renaissance"], primitive_fallback: { type: "box", scale: [0.3, 0.08, 0.08], color: "#A9A9A9" }, description: "A sculptor's chisel and hammer" },
  { id: "pottery_wheel", name: "Pottery Wheel", category: "equipment", tags: ["pottery", "wheel", "clay", "ceramic", "art"], domain: ["art", "craft"], primitive_fallback: { type: "cylinder", scale: [0.6, 0.8, 0.6], color: "#8B7355" }, description: "A spinning pottery wheel" },
  { id: "clay_lump", name: "Clay", category: "prop", tags: ["clay", "pottery", "material", "art"], domain: ["art", "craft"], primitive_fallback: { type: "sphere", scale: [0.3, 0.25, 0.3], color: "#BC8F8F" }, description: "A lump of wet clay" },

  // -- Musical Instruments (Art / Music) --
  { id: "piano", name: "Grand Piano", category: "prop", tags: ["piano", "music", "instrument", "keyboard"], domain: ["art", "music"], primitive_fallback: { type: "box", scale: [2, 1, 1.5], color: "#1C1C1C" }, description: "A grand piano" },
  { id: "violin", name: "Violin", category: "prop", tags: ["violin", "music", "instrument", "string"], domain: ["art", "music"], primitive_fallback: { type: "box", scale: [0.15, 0.6, 0.08], color: "#8B4513" }, description: "A violin" },
  { id: "drum", name: "Drum", category: "prop", tags: ["drum", "music", "instrument", "percussion"], domain: ["art", "music"], primitive_fallback: { type: "cylinder", scale: [0.4, 0.4, 0.4], color: "#D2691E" }, description: "A drum" },

  // -- Art Characters --
  { id: "character_artist", name: "Artist", category: "character", tags: ["artist", "painter", "creative"], domain: ["art", "renaissance"], primitive_fallback: { type: "cylinder", scale: [0.4, 1.7, 0.4], color: "#8B4513" }, description: "An artist wearing a beret and paint-stained clothes" },
  { id: "character_curator", name: "Museum Curator", category: "character", tags: ["curator", "museum", "guide", "expert"], domain: ["art", "museum"], primitive_fallback: { type: "cylinder", scale: [0.4, 1.7, 0.4], color: "#2F4F4F" }, description: "A museum curator in formal attire" },

  // ================================================================
  //  MATHEMATICS — shapes, tools, visualizations
  // ================================================================

  // -- Geometric Solids --
  { id: "math_cube", name: "Unit Cube", category: "prop", tags: ["cube", "geometry", "solid", "3d", "shape"], domain: ["math", "geometry"], primitive_fallback: { type: "box", scale: [1, 1, 1], color: "#4169E1" }, description: "A translucent unit cube for geometry study" },
  { id: "math_sphere", name: "Unit Sphere", category: "prop", tags: ["sphere", "geometry", "solid", "3d", "shape"], domain: ["math", "geometry"], primitive_fallback: { type: "sphere", scale: [1, 1, 1], color: "#FF6347" }, description: "A translucent unit sphere" },
  { id: "math_cylinder", name: "Cylinder", category: "prop", tags: ["cylinder", "geometry", "solid", "3d"], domain: ["math", "geometry"], primitive_fallback: { type: "cylinder", scale: [0.8, 1.5, 0.8], color: "#32CD32" }, description: "A geometric cylinder" },
  { id: "math_cone", name: "Cone", category: "prop", tags: ["cone", "geometry", "solid", "3d"], domain: ["math", "geometry"], primitive_fallback: { type: "cone", scale: [0.8, 1.5, 0.8], color: "#FF8C00" }, description: "A geometric cone" },
  { id: "math_pyramid", name: "Pyramid", category: "prop", tags: ["pyramid", "geometry", "solid", "tetrahedron"], domain: ["math", "geometry", "ancient_egyptian"], primitive_fallback: { type: "cone", scale: [1.2, 1.2, 1.2], color: "#DAA520" }, description: "A geometric pyramid" },
  { id: "math_torus", name: "Torus", category: "prop", tags: ["torus", "donut", "geometry", "topology"], domain: ["math", "geometry"], primitive_fallback: { type: "sphere", scale: [1, 0.4, 1], color: "#9370DB" }, description: "A torus (donut shape)" },

  // -- Coordinate Systems & Tools --
  { id: "math_axes", name: "3D Coordinate Axes", category: "equipment", tags: ["axes", "coordinate", "xyz", "origin", "cartesian"], domain: ["math", "physics", "geometry"], primitive_fallback: { type: "cylinder", scale: [0.05, 3, 0.05], color: "#FF0000" }, description: "A 3D coordinate axis system (X red, Y green, Z blue)" },
  { id: "math_grid_floor", name: "Grid Floor", category: "environment", tags: ["grid", "floor", "coordinate", "plane", "graph"], domain: ["math", "physics"], primitive_fallback: { type: "box", scale: [20, 0.02, 20], color: "#E8E8E8" }, description: "A floor with grid lines for coordinate reference" },
  { id: "math_ruler", name: "Ruler", category: "prop", tags: ["ruler", "measure", "length", "tool"], domain: ["math", "physics"], primitive_fallback: { type: "box", scale: [1.5, 0.02, 0.1], color: "#F5DEB3" }, description: "A ruler for measurement" },
  { id: "math_protractor", name: "Protractor", category: "prop", tags: ["protractor", "angle", "measure", "tool"], domain: ["math", "geometry"], primitive_fallback: { type: "sphere", scale: [0.5, 0.02, 0.5], color: "#E0E0FF" }, description: "A protractor for measuring angles" },
  { id: "math_compass", name: "Drawing Compass", category: "prop", tags: ["compass", "circle", "draw", "geometry", "tool"], domain: ["math", "geometry"], primitive_fallback: { type: "cone", scale: [0.1, 0.4, 0.1], color: "#A9A9A9" }, description: "A compass for drawing circles" },
  { id: "math_abacus", name: "Abacus", category: "prop", tags: ["abacus", "counting", "calculation", "arithmetic"], domain: ["math", "history"], primitive_fallback: { type: "box", scale: [0.6, 0.5, 0.1], color: "#8B4513" }, description: "A traditional abacus for counting" },
  { id: "math_chalkboard", name: "Chalkboard", category: "prop", tags: ["chalkboard", "blackboard", "equation", "classroom", "writing"], domain: ["math", "physics", "universal"], primitive_fallback: { type: "box", scale: [3, 2, 0.1], color: "#2F4F4F" }, description: "A large chalkboard with equations" },
  { id: "math_number_block", name: "Number Block", category: "prop", tags: ["number", "block", "digit", "counting"], domain: ["math"], primitive_fallback: { type: "box", scale: [0.5, 0.5, 0.5], color: "#FFD700" }, description: "A colorful block with a number on it" },
  { id: "math_dice", name: "Dice", category: "prop", tags: ["dice", "probability", "random", "statistics"], domain: ["math", "statistics"], primitive_fallback: { type: "box", scale: [0.3, 0.3, 0.3], color: "#FFFFFF" }, description: "A six-sided die for probability" },
  { id: "math_graph_board", name: "Graph Display", category: "equipment", tags: ["graph", "chart", "function", "plot", "display"], domain: ["math", "statistics", "physics"], primitive_fallback: { type: "box", scale: [2, 1.5, 0.05], color: "#1C1C1C" }, description: "A digital board displaying mathematical graphs" },

  // -- Math Spaces --
  { id: "math_classroom", name: "Classroom", category: "building", tags: ["classroom", "school", "education", "lecture"], domain: ["math", "physics", "universal"], primitive_fallback: { type: "box", scale: [12, 4, 10], color: "#F5F5DC" }, description: "A school classroom with desks and a chalkboard" },
  { id: "math_library", name: "Ancient Library", category: "building", tags: ["library", "knowledge", "books", "study"], domain: ["math", "history", "universal"], primitive_fallback: { type: "box", scale: [14, 6, 10], color: "#DEB887" }, description: "A grand library filled with knowledge" },

  // -- Math Characters --
  { id: "character_mathematician", name: "Mathematician", category: "character", tags: ["mathematician", "professor", "scholar", "teacher"], domain: ["math"], primitive_fallback: { type: "cylinder", scale: [0.4, 1.7, 0.4], color: "#4B0082" }, description: "A mathematician in thoughtful pose" },

  // ================================================================
  //  PHYSICS — labs, experiments, space, forces
  // ================================================================

  // -- Lab Equipment --
  { id: "physics_lab", name: "Physics Laboratory", category: "building", tags: ["lab", "laboratory", "physics", "science", "experiment"], domain: ["physics", "chemistry", "science"], primitive_fallback: { type: "box", scale: [14, 4, 10], color: "#E8E8E8" }, description: "A modern physics laboratory with equipment" },
  { id: "lab_bench", name: "Lab Bench", category: "prop", tags: ["bench", "table", "lab", "experiment"], domain: ["physics", "chemistry", "science"], primitive_fallback: { type: "box", scale: [3, 0.9, 1], color: "#2F4F4F" }, description: "A sturdy laboratory bench" },
  { id: "lab_beaker", name: "Beaker", category: "prop", tags: ["beaker", "glass", "liquid", "chemistry", "lab"], domain: ["physics", "chemistry", "science"], primitive_fallback: { type: "cylinder", scale: [0.15, 0.25, 0.15], color: "#87CEEB" }, description: "A glass laboratory beaker" },
  { id: "lab_flask", name: "Erlenmeyer Flask", category: "prop", tags: ["flask", "erlenmeyer", "chemistry", "lab", "science"], domain: ["physics", "chemistry", "science"], primitive_fallback: { type: "cone", scale: [0.2, 0.3, 0.2], color: "#98FB98" }, description: "An Erlenmeyer flask with liquid" },
  { id: "lab_test_tube", name: "Test Tube", category: "prop", tags: ["test_tube", "tube", "chemistry", "lab"], domain: ["physics", "chemistry", "science"], primitive_fallback: { type: "cylinder", scale: [0.04, 0.2, 0.04], color: "#E0FFFF" }, description: "A glass test tube" },
  { id: "lab_microscope", name: "Microscope", category: "equipment", tags: ["microscope", "lens", "magnify", "biology", "lab"], domain: ["physics", "biology", "science"], primitive_fallback: { type: "cylinder", scale: [0.15, 0.4, 0.15], color: "#2F2F2F" }, description: "A laboratory microscope" },
  { id: "lab_telescope", name: "Telescope", category: "equipment", tags: ["telescope", "astronomy", "star", "space", "lens"], domain: ["physics", "astronomy", "space"], primitive_fallback: { type: "cylinder", scale: [0.15, 1.2, 0.15], color: "#B8860B" }, description: "A telescope for astronomical observation" },

  // -- Physics Concepts (visual primitives) --
  { id: "physics_pendulum", name: "Pendulum", category: "equipment", tags: ["pendulum", "swing", "gravity", "motion", "oscillation"], domain: ["physics"], primitive_fallback: { type: "sphere", scale: [0.3, 0.3, 0.3], color: "#CD853F" }, description: "A pendulum bob (representing harmonic motion)" },
  { id: "physics_spring", name: "Spring", category: "prop", tags: ["spring", "elastic", "hooke", "force", "oscillation"], domain: ["physics"], primitive_fallback: { type: "cylinder", scale: [0.15, 0.8, 0.15], color: "#C0C0C0" }, description: "A coil spring (Hooke's law)" },
  { id: "physics_ramp", name: "Inclined Plane / Ramp", category: "prop", tags: ["ramp", "incline", "slope", "plane", "friction", "gravity"], domain: ["physics", "math"], primitive_fallback: { type: "box", scale: [3, 1.5, 1.5], color: "#A9A9A9" }, description: "An inclined plane for studying forces" },
  { id: "physics_pulley", name: "Pulley System", category: "equipment", tags: ["pulley", "rope", "force", "mechanical_advantage"], domain: ["physics"], primitive_fallback: { type: "cylinder", scale: [0.4, 0.1, 0.4], color: "#696969" }, description: "A pulley wheel and rope system" },
  { id: "physics_lever", name: "Lever & Fulcrum", category: "equipment", tags: ["lever", "fulcrum", "torque", "simple_machine"], domain: ["physics"], primitive_fallback: { type: "box", scale: [3, 0.1, 0.3], color: "#8B6914" }, description: "A lever balanced on a fulcrum" },
  { id: "physics_magnet", name: "Magnet", category: "prop", tags: ["magnet", "magnetic", "field", "attraction", "repulsion"], domain: ["physics"], primitive_fallback: { type: "box", scale: [0.4, 0.1, 0.2], color: "#FF0000" }, description: "A horseshoe magnet (red/blue poles)" },
  { id: "physics_prism", name: "Glass Prism", category: "prop", tags: ["prism", "light", "refraction", "spectrum", "optics", "rainbow"], domain: ["physics", "optics"], primitive_fallback: { type: "cone", scale: [0.3, 0.4, 0.3], color: "#E0FFFF" }, description: "A glass prism splitting white light into a spectrum" },
  { id: "physics_lens", name: "Convex Lens", category: "prop", tags: ["lens", "optics", "light", "focus", "refraction"], domain: ["physics", "optics"], primitive_fallback: { type: "sphere", scale: [0.4, 0.08, 0.4], color: "#B0E0E6" }, description: "A convex glass lens" },
  { id: "physics_battery", name: "Battery", category: "prop", tags: ["battery", "electricity", "voltage", "circuit", "energy"], domain: ["physics", "electronics"], primitive_fallback: { type: "cylinder", scale: [0.15, 0.4, 0.15], color: "#2F4F4F" }, description: "A battery cell" },
  { id: "physics_lightbulb", name: "Light Bulb", category: "prop", tags: ["bulb", "light", "electricity", "circuit", "lamp"], domain: ["physics", "electronics"], primitive_fallback: { type: "sphere", scale: [0.15, 0.2, 0.15], color: "#FFFFE0" }, description: "A light bulb (lit)" },
  { id: "physics_wire", name: "Wire / Cable", category: "prop", tags: ["wire", "cable", "circuit", "electricity", "conductor"], domain: ["physics", "electronics"], primitive_fallback: { type: "cylinder", scale: [0.02, 2, 0.02], color: "#B22222" }, description: "An electrical wire" },

  // -- Space / Astronomy --
  { id: "planet_earth", name: "Earth", category: "prop", tags: ["earth", "planet", "globe", "world", "astronomy"], domain: ["physics", "geography", "astronomy", "space"], primitive_fallback: { type: "sphere", scale: [2, 2, 2], color: "#4169E1" }, description: "Planet Earth" },
  { id: "planet_mars", name: "Mars", category: "prop", tags: ["mars", "planet", "red", "astronomy"], domain: ["physics", "astronomy", "space"], primitive_fallback: { type: "sphere", scale: [1.2, 1.2, 1.2], color: "#CD5C5C" }, description: "Planet Mars" },
  { id: "planet_generic", name: "Planet", category: "prop", tags: ["planet", "sphere", "astronomy", "solar_system"], domain: ["physics", "astronomy", "space"], primitive_fallback: { type: "sphere", scale: [1.5, 1.5, 1.5], color: "#DEB887" }, description: "A generic planet" },
  { id: "star_sun", name: "Sun / Star", category: "prop", tags: ["sun", "star", "light", "solar", "astronomy"], domain: ["physics", "astronomy", "space"], primitive_fallback: { type: "sphere", scale: [4, 4, 4], color: "#FFD700" }, description: "The Sun or a bright star" },
  { id: "moon", name: "Moon", category: "prop", tags: ["moon", "lunar", "satellite", "astronomy"], domain: ["physics", "astronomy", "space"], primitive_fallback: { type: "sphere", scale: [0.8, 0.8, 0.8], color: "#D3D3D3" }, description: "The Moon" },
  { id: "rocket", name: "Rocket", category: "prop", tags: ["rocket", "spacecraft", "launch", "space", "thrust"], domain: ["physics", "space"], primitive_fallback: { type: "cone", scale: [0.5, 2.5, 0.5], color: "#E8E8E8" }, description: "A rocket ship" },
  { id: "satellite", name: "Satellite", category: "prop", tags: ["satellite", "orbit", "space", "communication"], domain: ["physics", "space"], primitive_fallback: { type: "box", scale: [1.5, 0.3, 0.3], color: "#C0C0C0" }, description: "An orbiting satellite with solar panels" },
  { id: "space_station", name: "Space Station", category: "building", tags: ["station", "space", "iss", "orbital"], domain: ["physics", "space"], primitive_fallback: { type: "box", scale: [8, 3, 4], color: "#D3D3D3" }, description: "A space station module" },

  // -- Physics Characters --
  { id: "character_scientist", name: "Scientist", category: "character", tags: ["scientist", "researcher", "lab_coat", "professor", "physics"], domain: ["physics", "chemistry", "biology", "science"], primitive_fallback: { type: "cylinder", scale: [0.4, 1.7, 0.4], color: "#F5F5F5" }, description: "A scientist in a white lab coat" },
  { id: "character_astronaut", name: "Astronaut", category: "character", tags: ["astronaut", "space", "cosmonaut", "pilot"], domain: ["physics", "space"], primitive_fallback: { type: "cylinder", scale: [0.5, 1.8, 0.5], color: "#F0F0F0" }, description: "An astronaut in a spacesuit" },

  // ================================================================
  //  BIOLOGY — cells, organisms, ecosystems
  // ================================================================
  { id: "bio_cell", name: "Animal Cell", category: "prop", tags: ["cell", "biology", "membrane", "nucleus", "organelle"], domain: ["biology", "science"], primitive_fallback: { type: "sphere", scale: [2, 1.5, 2], color: "#FFE4E1" }, description: "A large animal cell with visible organelles" },
  { id: "bio_nucleus", name: "Cell Nucleus", category: "prop", tags: ["nucleus", "dna", "cell", "biology"], domain: ["biology", "science"], primitive_fallback: { type: "sphere", scale: [0.6, 0.6, 0.6], color: "#8B008B" }, description: "A cell nucleus" },
  { id: "bio_mitochondria", name: "Mitochondria", category: "prop", tags: ["mitochondria", "energy", "atp", "cell", "biology"], domain: ["biology", "science"], primitive_fallback: { type: "cylinder", scale: [0.2, 0.5, 0.15], color: "#FF6347" }, description: "A mitochondrion — the powerhouse of the cell" },
  { id: "bio_dna_helix", name: "DNA Double Helix", category: "prop", tags: ["dna", "helix", "gene", "genetics", "biology"], domain: ["biology", "science"], primitive_fallback: { type: "cylinder", scale: [0.3, 2, 0.3], color: "#4169E1" }, description: "A DNA double helix structure" },
  { id: "bio_plant_cell", name: "Plant Cell", category: "prop", tags: ["plant", "cell", "wall", "chloroplast", "biology"], domain: ["biology", "science"], primitive_fallback: { type: "box", scale: [2, 1.5, 2], color: "#98FB98" }, description: "A plant cell with cell wall and chloroplasts" },
  { id: "bio_heart", name: "Human Heart", category: "prop", tags: ["heart", "organ", "blood", "anatomy", "biology"], domain: ["biology", "science"], primitive_fallback: { type: "sphere", scale: [0.5, 0.6, 0.4], color: "#DC143C" }, description: "A human heart model" },
  { id: "bio_skeleton", name: "Skeleton Model", category: "prop", tags: ["skeleton", "bone", "anatomy", "biology"], domain: ["biology", "science"], primitive_fallback: { type: "cylinder", scale: [0.4, 1.7, 0.25], color: "#FFFEF0" }, description: "A human skeleton model" },
  { id: "bio_tree_section", name: "Tree Cross-Section", category: "prop", tags: ["tree", "ring", "cross_section", "growth", "biology"], domain: ["biology", "science"], primitive_fallback: { type: "cylinder", scale: [0.8, 0.2, 0.8], color: "#D2B48C" }, description: "A tree trunk cross-section showing growth rings" },
  { id: "bio_butterfly", name: "Butterfly", category: "prop", tags: ["butterfly", "insect", "metamorphosis", "biology"], domain: ["biology", "science"], primitive_fallback: { type: "box", scale: [0.4, 0.05, 0.3], color: "#FF8C00" }, description: "A butterfly with colorful wings" },

  // ================================================================
  //  CHEMISTRY
  // ================================================================
  { id: "chem_atom_model", name: "Atom Model", category: "prop", tags: ["atom", "electron", "proton", "neutron", "chemistry"], domain: ["chemistry", "physics", "science"], primitive_fallback: { type: "sphere", scale: [1, 1, 1], color: "#4682B4" }, description: "A Bohr model of an atom with electron orbits" },
  { id: "chem_molecule", name: "Molecule Model", category: "prop", tags: ["molecule", "bond", "chemistry", "structure"], domain: ["chemistry", "science"], primitive_fallback: { type: "sphere", scale: [0.6, 0.6, 0.6], color: "#FF4500" }, description: "A ball-and-stick molecular model" },
  { id: "chem_periodic_table", name: "Periodic Table", category: "equipment", tags: ["periodic", "table", "elements", "chemistry"], domain: ["chemistry", "science"], primitive_fallback: { type: "box", scale: [3, 2, 0.05], color: "#F0F8FF" }, description: "A large periodic table of elements" },
  { id: "chem_bunsen_burner", name: "Bunsen Burner", category: "equipment", tags: ["bunsen", "burner", "flame", "heat", "chemistry", "lab"], domain: ["chemistry", "science"], primitive_fallback: { type: "cylinder", scale: [0.08, 0.3, 0.08], color: "#4682B4" }, description: "A Bunsen burner with blue flame" },

  // ================================================================
  //  GEOGRAPHY — terrain, climate, maps
  // ================================================================
  { id: "geo_globe", name: "Globe", category: "prop", tags: ["globe", "earth", "map", "world", "geography"], domain: ["geography"], primitive_fallback: { type: "sphere", scale: [1.2, 1.2, 1.2], color: "#4682B4" }, description: "A desktop globe showing continents" },
  { id: "geo_mountain", name: "Mountain", category: "environment", tags: ["mountain", "peak", "terrain", "geography"], domain: ["geography", "geology"], primitive_fallback: { type: "cone", scale: [6, 8, 6], color: "#8B7355" }, description: "A tall mountain peak with snow cap" },
  { id: "geo_volcano", name: "Volcano", category: "landmark", tags: ["volcano", "eruption", "lava", "geology"], domain: ["geography", "geology", "science"], primitive_fallback: { type: "cone", scale: [5, 6, 5], color: "#8B0000" }, description: "A volcanic mountain" },
  { id: "geo_river", name: "River", category: "environment", tags: ["river", "water", "stream", "flow"], domain: ["geography"], primitive_fallback: { type: "box", scale: [30, 0.1, 3], color: "#4682B4" }, description: "A flowing river" },
  { id: "geo_desert_dune", name: "Sand Dune", category: "environment", tags: ["desert", "sand", "dune", "arid"], domain: ["geography"], primitive_fallback: { type: "sphere", scale: [8, 2, 6], color: "#F4A460" }, description: "A sand dune in a desert" },
  { id: "geo_iceberg", name: "Iceberg", category: "environment", tags: ["ice", "iceberg", "arctic", "polar", "glacier"], domain: ["geography"], primitive_fallback: { type: "cone", scale: [3, 4, 3], color: "#E0FFFF" }, description: "An iceberg floating in cold water" },
  { id: "geo_compass_nav", name: "Navigation Compass", category: "prop", tags: ["compass", "navigation", "direction", "north"], domain: ["geography"], primitive_fallback: { type: "cylinder", scale: [0.3, 0.05, 0.3], color: "#B8860B" }, description: "A navigation compass" },
  { id: "geo_map_table", name: "Map Table", category: "prop", tags: ["map", "table", "cartography", "geography"], domain: ["geography", "history"], primitive_fallback: { type: "box", scale: [2.5, 0.85, 1.5], color: "#DEB887" }, description: "A table with a large map spread on it" },

  // ================================================================
  //  HISTORY — carried over and expanded
  // ================================================================

  // -- Ancient Chinese --
  { id: "chinese_gate_tang", name: "Tang Dynasty City Gate", category: "landmark", tags: ["gate", "entrance", "chinese", "tang"], domain: ["history", "tang_dynasty", "ancient_chinese"], primitive_fallback: { type: "box", scale: [8, 6, 2], color: "#8B4513" }, description: "A grand wooden gate with curved rooflines typical of Tang architecture" },
  { id: "chinese_shop_front", name: "Chinese Shop Front", category: "building", tags: ["shop", "store", "market", "chinese"], domain: ["history", "tang_dynasty", "ancient_chinese"], primitive_fallback: { type: "box", scale: [5, 4, 4], color: "#A0522D" }, description: "A traditional Chinese storefront" },
  { id: "chinese_tavern", name: "Chinese Tavern", category: "building", tags: ["tavern", "inn", "chinese"], domain: ["history", "tang_dynasty", "ancient_chinese"], primitive_fallback: { type: "box", scale: [6, 5, 5], color: "#8B6914" }, description: "A two-story tavern with lanterns" },
  { id: "chinese_house", name: "Chinese House", category: "building", tags: ["house", "home", "chinese"], domain: ["history", "tang_dynasty", "ancient_chinese"], primitive_fallback: { type: "box", scale: [5, 3, 4], color: "#D2B48C" }, compound_parts: [
    { primitive: "box", offset: [0, 1.2, 0], scale: [5, 2.4, 4], color: "#D2B48C" },
    { primitive: "box", offset: [0, 2.8, 0], scale: [5.5, 0.8, 4.5], color: "#8B4513" },
    { primitive: "box", offset: [0, 0, 1.8], scale: [1.2, 2, 0.1], color: "#654321" },
  ], description: "A traditional Chinese dwelling" },
  { id: "pagoda", name: "Pagoda", category: "landmark", tags: ["pagoda", "tower", "buddhist", "chinese"], domain: ["history", "tang_dynasty", "ancient_chinese"], primitive_fallback: { type: "cylinder", scale: [3, 12, 3], color: "#CD853F" }, compound_parts: [
    { primitive: "box", offset: [0, 1.5, 0], scale: [4, 3, 4], color: "#CD853F" },
    { primitive: "box", offset: [0, 3.8, 0], scale: [4.5, 0.4, 4.5], color: "#8B4513" },
    { primitive: "box", offset: [0, 5, 0], scale: [3.2, 2.5, 3.2], color: "#CD853F" },
    { primitive: "box", offset: [0, 6.8, 0], scale: [3.7, 0.4, 3.7], color: "#8B4513" },
    { primitive: "box", offset: [0, 8, 0], scale: [2.4, 2, 2.4], color: "#CD853F" },
    { primitive: "cone", offset: [0, 10, 0], scale: [1.5, 2, 1.5], color: "#8B4513" },
  ], description: "A multi-tiered Buddhist pagoda" },
  { id: "lantern_red", name: "Red Lantern", category: "decoration", tags: ["lantern", "light", "chinese", "red"], domain: ["history", "ancient_chinese"], primitive_fallback: { type: "sphere", scale: [0.4, 0.5, 0.4], color: "#FF0000" }, description: "A traditional red Chinese lantern" },
  { id: "silk_roll", name: "Silk Roll", category: "prop", tags: ["silk", "fabric", "trade", "textile"], domain: ["history", "ancient_chinese", "silk_road"], primitive_fallback: { type: "cylinder", scale: [0.3, 0.8, 0.3], color: "#DC143C" }, description: "A roll of fine silk fabric" },
  { id: "ceramic_pot", name: "Ceramic Pot", category: "prop", tags: ["ceramic", "pottery", "chinese"], domain: ["history", "ancient_chinese", "art"], primitive_fallback: { type: "cylinder", scale: [0.4, 0.6, 0.4], color: "#4682B4" }, description: "A blue-and-white ceramic pot" },

  // -- Ancient Roman / Greek --
  { id: "roman_column", name: "Roman Column", category: "decoration", tags: ["column", "pillar", "roman", "greek", "classical"], domain: ["history", "ancient_roman", "ancient_greek", "art"], primitive_fallback: { type: "cylinder", scale: [0.4, 5, 0.4], color: "#F5F5DC" }, description: "A classical stone column" },
  { id: "roman_arch", name: "Roman Arch", category: "landmark", tags: ["arch", "gate", "roman", "triumph"], domain: ["history", "ancient_roman"], primitive_fallback: { type: "box", scale: [6, 5, 1.5], color: "#D2B48C" }, description: "A Roman triumphal arch" },
  { id: "greek_temple", name: "Greek Temple", category: "landmark", tags: ["temple", "greek", "parthenon", "classical"], domain: ["history", "ancient_greek", "art"], primitive_fallback: { type: "box", scale: [10, 6, 8], color: "#F5F5DC" }, description: "A Greek temple with columned facade" },
  { id: "amphitheater", name: "Amphitheater", category: "landmark", tags: ["amphitheater", "arena", "colosseum", "roman"], domain: ["history", "ancient_roman"], primitive_fallback: { type: "cylinder", scale: [10, 4, 10], color: "#D2B48C" }, description: "A Roman amphitheater" },

  // -- Medieval --
  { id: "castle", name: "Castle", category: "landmark", tags: ["castle", "fortress", "medieval", "tower"], domain: ["history", "medieval"], primitive_fallback: { type: "box", scale: [10, 8, 10], color: "#808080" }, description: "A medieval stone castle with towers" },
  { id: "castle_tower", name: "Castle Tower", category: "building", tags: ["tower", "castle", "medieval", "fortress"], domain: ["history", "medieval"], primitive_fallback: { type: "cylinder", scale: [2, 10, 2], color: "#696969" }, description: "A tall stone castle tower" },
  { id: "medieval_house", name: "Medieval House", category: "building", tags: ["house", "medieval", "timber"], domain: ["history", "medieval"], primitive_fallback: { type: "box", scale: [4, 4, 4], color: "#8B7355" }, description: "A timber-framed medieval house" },
  { id: "cathedral", name: "Cathedral", category: "landmark", tags: ["cathedral", "church", "gothic", "medieval", "religion"], domain: ["history", "medieval", "art"], primitive_fallback: { type: "box", scale: [8, 12, 14], color: "#A9A9A9" }, description: "A Gothic cathedral" },

  // -- Silk Road / Trade --
  { id: "market_stall", name: "Market Stall", category: "prop", tags: ["market", "stall", "trade", "vendor"], domain: ["history", "universal"], primitive_fallback: { type: "box", scale: [3, 2.5, 2], color: "#DEB887" }, description: "A market stall" },
  { id: "camel", name: "Camel", category: "prop", tags: ["camel", "animal", "silk_road", "trade", "desert"], domain: ["history", "geography"], primitive_fallback: { type: "box", scale: [2, 1.8, 0.8], color: "#C4A882" }, description: "A camel for trade caravans" },
  { id: "tent_nomad", name: "Nomad Tent", category: "building", tags: ["tent", "nomad", "camp", "yurt"], domain: ["history", "geography"], primitive_fallback: { type: "cone", scale: [3, 2.5, 3], color: "#D2B48C" }, description: "A nomadic tent/yurt" },
  { id: "spice_bag", name: "Spice Bag", category: "prop", tags: ["spice", "trade", "food"], domain: ["history"], primitive_fallback: { type: "sphere", scale: [0.4, 0.5, 0.4], color: "#DAA520" }, description: "A bag of exotic spices" },

  // -- History Characters --
  { id: "character_chinese_male", name: "Chinese Man", category: "character", tags: ["male", "chinese"], domain: ["history", "ancient_chinese"], primitive_fallback: { type: "cylinder", scale: [0.4, 1.7, 0.4], color: "#DEB887" }, description: "A man in traditional Chinese clothing" },
  { id: "character_chinese_female", name: "Chinese Woman", category: "character", tags: ["female", "chinese"], domain: ["history", "ancient_chinese"], primitive_fallback: { type: "cylinder", scale: [0.35, 1.6, 0.35], color: "#FFB6C1" }, description: "A woman in traditional Chinese clothing" },
  { id: "character_persian_merchant", name: "Persian Merchant", category: "character", tags: ["male", "persian", "merchant", "trade"], domain: ["history", "silk_road"], primitive_fallback: { type: "cylinder", scale: [0.45, 1.75, 0.45], color: "#B8860B" }, description: "A Persian merchant with turban and robes" },
  { id: "character_knight", name: "Knight", category: "character", tags: ["knight", "armor", "medieval", "soldier"], domain: ["history", "medieval"], primitive_fallback: { type: "cylinder", scale: [0.45, 1.8, 0.45], color: "#A9A9A9" }, description: "A medieval knight in armor" },
  { id: "character_roman_soldier", name: "Roman Soldier", category: "character", tags: ["soldier", "roman", "legionnaire"], domain: ["history", "ancient_roman"], primitive_fallback: { type: "cylinder", scale: [0.45, 1.8, 0.45], color: "#8B0000" }, description: "A Roman legionnaire" },

  // ================================================================
  //  MODERN / TECHNOLOGY
  // ================================================================
  { id: "computer_desk", name: "Computer Desk", category: "prop", tags: ["computer", "desk", "monitor", "screen", "technology"], domain: ["technology", "modern", "universal"], primitive_fallback: { type: "box", scale: [1.5, 0.8, 0.8], color: "#2F2F2F" }, description: "A desk with a computer monitor" },
  { id: "whiteboard", name: "Whiteboard", category: "prop", tags: ["whiteboard", "board", "marker", "presentation"], domain: ["technology", "modern", "universal"], primitive_fallback: { type: "box", scale: [3, 2, 0.08], color: "#FFFFFF" }, description: "A modern whiteboard" },
  { id: "solar_panel", name: "Solar Panel", category: "prop", tags: ["solar", "panel", "energy", "renewable", "electricity"], domain: ["physics", "technology", "geography"], primitive_fallback: { type: "box", scale: [2, 0.1, 1.5], color: "#191970" }, description: "A solar panel" },
  { id: "wind_turbine", name: "Wind Turbine", category: "landmark", tags: ["wind", "turbine", "energy", "renewable"], domain: ["physics", "technology", "geography"], primitive_fallback: { type: "cylinder", scale: [0.3, 10, 0.3], color: "#F5F5F5" }, description: "A wind turbine" },
];

// ---- Helper: find best matching asset ----
export function findAsset(
  query: string,
  domain?: string,
  category?: string
): AssetEntry | null {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  let bestMatch: AssetEntry | null = null;
  let bestScore = 0;

  for (const asset of ASSET_REGISTRY) {
    let score = 0;

    // Tag matching
    for (const tag of asset.tags) {
      if (queryWords.some((w) => tag.includes(w) || w.includes(tag))) {
        score += 2;
      }
    }

    // Name matching
    const nameLower = asset.name.toLowerCase();
    if (queryLower.includes(nameLower) || nameLower.includes(queryLower)) {
      score += 5;
    }

    // Domain matching
    if (domain && asset.domain.some((d) => d === domain || d === "universal")) {
      score += 1;
    }

    // Category matching
    if (category && asset.category === category) {
      score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = asset;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}
