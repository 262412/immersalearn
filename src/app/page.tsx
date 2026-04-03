"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Sparkles,
  BookOpen,
  Sword,
  Search,
  Gamepad2,
  Users,
  Film,
  ChevronRight,
  Loader2,
  GraduationCap,
  Shield,
  Brain,
  Eye,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAppStore } from "@/stores/session-store";
import type { StudentPreferences } from "@/lib/types";

const GENRES = [
  { id: "adventure" as const, label: "Adventure", icon: Sword, desc: "Explore, discover, and overcome challenges" },
  { id: "mystery" as const, label: "Mystery", icon: Search, desc: "Gather clues and solve puzzles" },
  { id: "simulation" as const, label: "Simulation", icon: Gamepad2, desc: "Make decisions and see consequences" },
  { id: "roleplay" as const, label: "Role-Play", icon: Users, desc: "Become a character in the world" },
  { id: "documentary" as const, label: "Documentary", icon: Film, desc: "Witness and investigate firsthand" },
];

const DIFFICULTIES = [
  { id: "easy" as const, label: "Guided", desc: "More hints and scaffolding" },
  { id: "medium" as const, label: "Balanced", desc: "Moderate challenge" },
  { id: "hard" as const, label: "Expert", desc: "Minimal hints, maximum depth" },
];

// ---- Subject Presets & Curriculum Options ----
const SUBJECT_PRESETS = [
  { id: "art", label: "Art", curricula: ["GCSE AQA Art", "GCSE Edexcel Art", "A-Level Art", "IB Visual Arts", "AP Art History"] },
  { id: "math", label: "Mathematics", curricula: ["GCSE AQA Maths", "GCSE Edexcel Maths", "A-Level Maths", "IB Mathematics", "AP Calculus"] },
  { id: "physics", label: "Physics", curricula: ["GCSE AQA Physics", "GCSE Edexcel Physics", "A-Level Physics", "IB Physics", "AP Physics"] },
  { id: "chemistry", label: "Chemistry", curricula: ["GCSE AQA Chemistry", "A-Level Chemistry", "IB Chemistry", "AP Chemistry"] },
  { id: "biology", label: "Biology", curricula: ["GCSE AQA Biology", "A-Level Biology", "IB Biology", "AP Biology"] },
  { id: "history", label: "History", curricula: ["GCSE AQA History", "GCSE Edexcel History", "A-Level History", "IB History", "AP World History"] },
  { id: "geography", label: "Geography", curricula: ["GCSE AQA Geography", "A-Level Geography", "IB Geography", "AP Human Geography"] },
  { id: "literature", label: "Literature", curricula: ["GCSE English Lit", "A-Level English Lit", "IB Language & Lit", "AP English"] },
  { id: "cs", label: "Computer Science", curricula: ["GCSE AQA CS", "A-Level CS", "IB CS", "AP CS"] },
  { id: "other", label: "Other", curricula: ["Custom"] },
];

// ---- Demo Texts (multi-subject) ----
const DEMOS: Record<string, { subject: string; topic: string; curriculum: string; text: string }> = {
  art: {
    subject: "Art", topic: "The Renaissance Masters", curriculum: "GCSE AQA Art",
    text: `The Renaissance: A Revolution in Art (14th–17th Century)

The Renaissance, meaning "rebirth," was a cultural movement that began in Florence, Italy in the 14th century and spread across Europe. It marked a dramatic shift from the flat, symbolic art of the Medieval period to naturalistic, human-centered works.

Key Techniques Developed:
- Linear Perspective: Filippo Brunelleschi demonstrated in 1415 that parallel lines converge at a vanishing point, creating the illusion of depth on a flat surface. Leon Battista Alberti later published "De Pictura" (1435) formalizing these rules.
- Chiaroscuro: The use of strong contrasts between light and dark to give the illusion of three-dimensional volume. Leonardo da Vinci was a master of this technique, notably in the Mona Lisa.
- Sfumato: A technique of blending colors and tones so subtly that there are no harsh outlines — like smoke dissolving. Leonardo's sfumato created the mysterious smile of the Mona Lisa.
- Fresco: Painting on wet plaster so the pigment bonds with the wall. Michelangelo's Sistine Chapel ceiling (1508–1512) is the most famous fresco, covering over 5,000 square feet.

Major Artists:
- Leonardo da Vinci (1452–1519): Painter, scientist, inventor. Key works: Mona Lisa, The Last Supper, Vitruvian Man. He filled notebooks with anatomical studies that influenced his art.
- Michelangelo Buonarroti (1475–1564): Sculptor, painter, architect. Key works: David (1504, marble, 5.17m tall), Sistine Chapel ceiling, the dome of St. Peter's Basilica.
- Raphael Sanzio (1483–1520): Known for clarity and harmony. Key work: The School of Athens (1509–1511), which depicts Plato, Aristotle, and other philosophers in a grand architectural setting.
- Sandro Botticelli (1445–1510): Key work: The Birth of Venus (c. 1485), depicting the goddess Venus emerging from the sea.

Patronage played a crucial role. The Medici family of Florence funded many artists. Pope Julius II commissioned both Michelangelo's Sistine Chapel and Raphael's Vatican frescoes.

The Renaissance fundamentally changed how artists saw the world — not as a symbol of divine order, but as a subject worthy of careful observation and faithful representation.`,
  },
  math: {
    subject: "Mathematics", topic: "Geometry — Pythagoras and Trigonometry", curriculum: "GCSE AQA Maths",
    text: `Pythagoras' Theorem and Introduction to Trigonometry

Pythagoras' Theorem:
In any right-angled triangle, the square of the hypotenuse (the side opposite the right angle) is equal to the sum of the squares of the other two sides. Written as: a² + b² = c², where c is the hypotenuse.

Example: If a = 3 cm and b = 4 cm, then c² = 9 + 16 = 25, so c = 5 cm. This is the famous 3-4-5 right triangle.

The theorem can be used to:
- Find the length of a missing side in a right-angled triangle
- Check if a triangle is right-angled (if a² + b² = c² holds, it is)
- Calculate distances in coordinate geometry (the distance between two points)

Pythagorean Triples are sets of three whole numbers that satisfy the theorem: (3,4,5), (5,12,13), (8,15,17), (7,24,25).

Trigonometry — SOH CAH TOA:
In a right-angled triangle, three trigonometric ratios relate the angles to the side lengths:
- sin(θ) = Opposite / Hypotenuse (SOH)
- cos(θ) = Adjacent / Hypotenuse (CAH)
- tan(θ) = Opposite / Adjacent (TOA)

Where θ (theta) is the angle you're working with (not the right angle).

Example: In a right triangle where the angle θ = 30°, the hypotenuse = 10 cm:
- Opposite = 10 × sin(30°) = 10 × 0.5 = 5 cm
- Adjacent = 10 × cos(30°) = 10 × 0.866 = 8.66 cm

Finding angles: If you know two sides, you can find an angle using inverse functions:
- θ = sin⁻¹(Opposite / Hypotenuse)
- θ = cos⁻¹(Adjacent / Hypotenuse)
- θ = tan⁻¹(Opposite / Adjacent)

Applications include measuring heights of buildings, distances across rivers, angles of elevation and depression, and navigation.`,
  },
  physics: {
    subject: "Physics", topic: "Newton's Laws of Motion", curriculum: "GCSE AQA Physics",
    text: `Newton's Laws of Motion

Sir Isaac Newton (1643–1727) published his three laws of motion in "Philosophiæ Naturalis Principia Mathematica" (1687). These laws form the foundation of classical mechanics.

First Law (Law of Inertia):
An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an unbalanced force.
- Inertia is the tendency of an object to resist changes in its state of motion
- A heavier object has more inertia than a lighter one
- Example: A ball rolling on a flat surface will eventually stop due to friction (an external force). Without friction, it would roll forever.

Second Law (F = ma):
The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. Force = mass × acceleration (F = ma).
- Force is measured in Newtons (N). 1 N = 1 kg × 1 m/s²
- If you double the force on an object, its acceleration doubles
- If you double the mass, the acceleration halves for the same force
- Example: A 2 kg object with a net force of 10 N accelerates at 5 m/s²

Third Law (Action-Reaction):
For every action, there is an equal and opposite reaction. When object A exerts a force on object B, object B exerts an equal force in the opposite direction on object A.
- The forces act on DIFFERENT objects
- Example: When you push against a wall, the wall pushes back on you with equal force
- Rocket propulsion: hot gas is expelled downward (action), the rocket moves upward (reaction)
- Walking: your foot pushes backward on the ground, the ground pushes you forward

Weight vs Mass:
- Mass is the amount of matter in an object (measured in kg, constant everywhere)
- Weight is the force of gravity on an object: W = mg, where g = 9.8 m/s² on Earth
- An astronaut has the same mass on the Moon but weighs about 1/6 as much because the Moon's gravity is weaker (g ≈ 1.6 m/s²)

Resultant Forces:
When multiple forces act on an object, the resultant (net) force determines the motion. If forces are balanced (net force = 0), the object is in equilibrium — it stays still or moves at constant velocity.`,
  },
  history: {
    subject: "History", topic: "The Silk Road", curriculum: "GCSE AQA History",
    text: `The Silk Road: Ancient Trade Routes Connecting East and West

The Silk Road was a network of trade routes connecting China and the Far East with the Middle East and Europe. Established when the Han Dynasty in China officially opened trade with the West in 130 B.C., the Silk Road routes remained in use until A.D. 1453, when the Ottoman Empire boycotted trade with China and closed them.

The Silk Road was not a single route but rather a series of major trade routes spanning roughly 4,000 miles. The main overland route started in Chang'an (modern Xi'an), the capital of the Han Dynasty. From Chang'an, the road headed northwest through the Hexi Corridor to Dunhuang, where it split into northern and southern routes around the Taklamakan Desert.

Key trade goods traveling east to west included silk, porcelain, tea, spices (cinnamon, ginger), paper, and gunpowder. Goods traveling west to east included gold, silver, glassware, wool textiles, horses from Central Asia, and grapes.

The Silk Road was not just about trade in goods. It was a major conduit for the exchange of ideas, religions, and technologies. Buddhism spread from India to China along the Silk Road. Islam later traveled the same routes. Technologies such as papermaking traveled westward.

Key figures:
- Zhang Qian (张骞): A Han Dynasty diplomat who first explored the western regions in 138 B.C. He was captured by the Xiongnu and held for 13 years before escaping and completing his mission.
- Emperor Wu of Han (汉武帝): Commissioned Zhang Qian's expedition and actively promoted trade along the Silk Road.
- Marco Polo: The Venetian merchant who traveled the Silk Road in the 13th century and wrote extensively about his experiences in China.

Major stops along the route included Samarkand (in modern Uzbekistan), a major trading hub. The caravanserais (roadside inns) provided food, water, and shelter, typically spaced 30–40 km apart — roughly a day's journey by camel.`,
  },
  biology: {
    subject: "Biology", topic: "Cell Division — Mitosis", curriculum: "GCSE AQA Biology",
    text: `Cell Division: Mitosis

Mitosis is the process by which a single cell divides to produce two genetically identical daughter cells. It is essential for growth, repair of damaged tissue, and asexual reproduction.

The Cell Cycle:
Before mitosis begins, the cell goes through interphase — a preparation stage where:
- The cell grows and carries out normal functions (G1 phase)
- DNA is replicated so each chromosome now has two identical copies (sister chromatids) joined at the centromere (S phase)
- The cell checks for errors and prepares for division (G2 phase)

The Four Stages of Mitosis:

1. Prophase: Chromosomes condense and become visible. The nuclear membrane begins to break down. Spindle fibers form from the centrioles and extend across the cell.

2. Metaphase: Chromosomes line up along the middle (equator) of the cell. Spindle fibers attach to the centromere of each chromosome. This ensures each daughter cell will get one copy.

3. Anaphase: The centromeres split. Sister chromatids are pulled to opposite poles of the cell by the shortening spindle fibers. The cell elongates.

4. Telophase: Chromatids arrive at opposite poles. Nuclear membranes reform around each set of chromosomes. Chromosomes begin to decondense.

Cytokinesis: The cytoplasm divides, creating two separate daughter cells. In animal cells, the membrane pinches inward (cleavage furrow). In plant cells, a cell plate forms.

Result: Two genetically identical diploid cells, each with the same number of chromosomes as the parent cell (46 in humans).

Importance of Mitosis:
- Growth: A human starts as a single fertilized egg and grows to trillions of cells through mitosis
- Repair: When you cut your skin, mitosis produces new cells to heal the wound
- Replacement: Red blood cells live only about 120 days and must be constantly replaced

Cancer and Uncontrolled Mitosis:
Cancer occurs when mutations disrupt the normal controls on the cell cycle, leading to uncontrolled cell division. Tumors form when cells divide without stopping.`,
  },
};

export default function HomePage() {
  const router = useRouter();
  const store = useAppStore();

  const [step, setStep] = useState(1);
  const [textContent, setTextContent] = useState("");
  const [subject, setSubject] = useState("Art");
  const [topic, setTopic] = useState("");
  const [curriculum, setCurriculum] = useState("GCSE AQA Art");
  const [genre, setGenre] = useState<StudentPreferences["genre"]>("adventure");
  const [difficulty, setDifficulty] = useState<StudentPreferences["difficulty"]>("medium");
  const [studentName, setStudentName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState("");

  // File upload state
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedPages, setUploadedPages] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current subject's curriculum options
  const currentSubjectPreset = SUBJECT_PRESETS.find((s) => s.label === subject) || SUBJECT_PRESETS.find((s) => s.id === "other")!;

  const loadDemo = (demoKey?: string) => {
    const key = demoKey || "history";
    const demo = DEMOS[key];
    if (!demo) return;
    setTextContent(demo.text);
    setSubject(demo.subject);
    setTopic(demo.topic);
    setCurriculum(demo.curriculum);
    setInputMode("paste");
    setUploadedFile(null);
  };

  // ---- File Upload Handlers ----
  const handleFile = useCallback(async (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".txt", ".md", ".markdown", ".docx"];

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      setUploadError(`Unsupported file type. Supported: PDF, TXT, MD, DOCX`);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 20MB.");
      return;
    }

    setUploadedFile(file);
    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      // Ensure text is always a string
      const parsed = Array.isArray(data.text)
        ? data.text.join("\n\n")
        : String(data.text ?? "");
      setTextContent(parsed);
      setUploadedPages(data.pages || 1);

      // Try to auto-detect topic from filename
      if (!topic) {
        const nameWithoutExt = file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
        setTopic(nameWithoutExt);
      }
    } catch (error: any) {
      setUploadError(error.message || "Failed to parse file");
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  }, [topic]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearUpload = () => {
    setUploadedFile(null);
    setTextContent("");
    setUploadError(null);
    setUploadedPages(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startGeneration = async () => {
    if (!textContent.trim()) return;

    setIsGenerating(true);

    try {
      // Stage 1: Knowledge Extraction
      setGenerationStage("Extracting knowledge from textbook...");
      store.setGenerationProgress({
        stage: "extracting",
        progress: 15,
        message: "Analyzing textbook content...",
      });

      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textbookContent: textContent,
          subject,
          topic,
          curriculumSpec: `Curriculum: ${curriculum}`,
        }),
      });
      const extractData = await extractRes.json();

      if (!extractRes.ok || !extractData.knowledgeGraph)
        throw new Error(extractData.error || "Failed to extract knowledge");
      const knowledgeGraph = extractData.knowledgeGraph;
      store.setKnowledgeGraph(knowledgeGraph);

      // Stage 2: Script Generation
      setGenerationStage("Writing interactive script...");
      store.setGenerationProgress({
        stage: "scripting",
        progress: 40,
        message: "Creating your adventure...",
      });

      const scriptRes = await fetch("/api/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowledgeGraph,
          preferences: { genre, difficulty, name: studentName || "Explorer" },
        }),
      });
      const scriptData = await scriptRes.json();

      if (!scriptRes.ok || !scriptData.script)
        throw new Error(scriptData.error || "Failed to generate script");
      const script = scriptData.script;
      store.setScript(script);

      // Stage 3: Verification
      setGenerationStage("Verifying factual accuracy...");
      store.setGenerationProgress({
        stage: "verifying",
        progress: 60,
        message: "Cross-checking facts...",
      });

      const verifyRes = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, knowledgeGraph }),
      });
      const { report } = await verifyRes.json();
      if (report) store.setVerificationReport(report);

      // Stage 4: Scene Generation (first scene)
      setGenerationStage("Building 3D world...");
      store.setGenerationProgress({
        stage: "building_scene",
        progress: 80,
        message: "Constructing your world...",
      });

      const firstAct = script.acts[0];
      const firstScene = firstAct?.scenes[0];

      if (firstAct && firstScene) {
        const sceneRes = await fetch("/api/scene", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            script,
            actId: firstAct.id,
            sceneId: firstScene.id,
          }),
        });
        const sceneData = await sceneRes.json();

        if (!sceneRes.ok || !sceneData.sceneGraph) {
          throw new Error(sceneData.error || "Failed to build 3D scene");
        }

        store.addSceneGraph(firstScene.id, sceneData.sceneGraph);
        store.setCurrentSceneGraph(sceneData.sceneGraph);

        // Initialize session
        store.initSession(script.id, firstAct.id, firstScene.id);
      } else {
        throw new Error("Script has no scenes");
      }

      store.setGenerationProgress({
        stage: "ready",
        progress: 100,
        message: "Your world is ready!",
      });

      // Navigate to experience
      router.push(`/experience/${script.id}`);
    } catch (error: any) {
      console.error("Generation error:", error);
      setGenerationStage(`Error: ${error.message}`);
      store.setGenerationProgress({
        stage: "error",
        progress: 0,
        message: error.message,
      });
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">ImmersaLearn</h1>
              <p className="text-xs text-gray-400">Where Curriculum Comes Alive</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><GraduationCap size={12} /> Curriculum-Aligned</span>
            <span className="flex items-center gap-1"><Shield size={12} /> Anti-Hallucination</span>
            <span className="flex items-center gap-1"><Brain size={12} /> Pedagogy-Embedded</span>
            <span className="flex items-center gap-1"><Eye size={12} /> Teacher-Reviewed</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* Generating overlay */}
        {isGenerating && (
          <div className="fixed inset-0 z-50 bg-gray-950/95 flex flex-col items-center justify-center">
            <div className="w-20 h-20 mb-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center animate-pulse-glow">
              <Sparkles size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{generationStage}</h2>
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000"
                style={{ width: `${store.generationProgress.progress}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-3">
              {store.generationProgress.message}
            </p>
          </div>
        )}

        {/* Step 1: Upload Content */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Upload Your Learning Material</h2>
              <p className="text-gray-400 text-sm">
                Upload a PDF, DOCX, or TXT file — or paste text directly
              </p>
            </div>

            {/* Subject & Topic inputs */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSubject(val);
                    // Auto-update curriculum to first option for new subject
                    const preset = SUBJECT_PRESETS.find((s) => s.label === val);
                    if (preset && preset.curricula[0]) setCurriculum(preset.curricula[0]);
                  }}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                >
                  {SUBJECT_PRESETS.map((s) => (
                    <option key={s.id} value={s.label}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                  placeholder="e.g. Pythagoras, Renaissance Art, Newton's Laws..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Curriculum</label>
                <select
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                >
                  {currentSubjectPreset.curricula.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input Mode Toggle */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setInputMode("upload")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  inputMode === "upload"
                    ? "bg-amber-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
                }`}
              >
                <Upload size={12} /> Upload File
              </button>
              <button
                onClick={() => setInputMode("paste")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  inputMode === "paste"
                    ? "bg-amber-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
                }`}
              >
                <FileText size={12} /> Paste Text
              </button>
              <div className="flex-1" />
              <div className="relative">
                <button
                  onClick={() => setShowDemoMenu((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs text-gray-300 transition-colors"
                >
                  <BookOpen size={12} /> Load Demo ▾
                </button>
                {showDemoMenu && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-30">
                    {Object.entries(DEMOS).map(([key, demo]) => (
                      <button
                        key={key}
                        onClick={() => { loadDemo(key); setShowDemoMenu(false); }}
                        className="w-full text-left px-3 py-2.5 text-xs text-gray-300 hover:bg-gray-700 hover:text-white first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        <span className="font-medium">{demo.subject}</span>
                        <span className="text-gray-500"> — {demo.topic}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upload Mode */}
            {inputMode === "upload" && (
              <>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md,.markdown,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {/* No file uploaded yet: show drop zone */}
                {!uploadedFile && !textContent && (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                      isDragOver
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-gray-700 bg-gray-900/50 hover:border-gray-500 hover:bg-gray-900"
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={32} className="text-amber-400 animate-spin mb-3" />
                        <p className="text-sm text-gray-300">Parsing file...</p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center mb-4">
                          <Upload size={24} className={isDragOver ? "text-amber-400" : "text-gray-400"} />
                        </div>
                        <p className="text-sm text-gray-300 mb-1">
                          {isDragOver ? "Drop your file here" : "Drag & drop your file here"}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          or click to browse
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-red-900/30 text-red-300 text-xs rounded">PDF</span>
                          <span className="px-2 py-0.5 bg-blue-900/30 text-blue-300 text-xs rounded">DOCX</span>
                          <span className="px-2 py-0.5 bg-green-900/30 text-green-300 text-xs rounded">TXT</span>
                          <span className="px-2 py-0.5 bg-purple-900/30 text-purple-300 text-xs rounded">MD</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Maximum 20MB</p>
                      </>
                    )}
                  </div>
                )}

                {/* Upload error */}
                {uploadError && (
                  <div className="flex items-center gap-2 mt-3 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                    <p className="text-xs text-red-300">{uploadError}</p>
                    <button onClick={() => setUploadError(null)} className="ml-auto text-red-400 hover:text-red-300">
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* File uploaded successfully: show preview */}
                {uploadedFile && textContent && (
                  <div>
                    {/* File info bar */}
                    <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-800/30 rounded-lg mb-3">
                      <CheckCircle size={16} className="text-green-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-green-200 font-medium truncate">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-green-300/70">
                          {uploadedPages > 1 ? `${uploadedPages} pages` : "1 page"} · {(uploadedFile.size / 1024).toFixed(0)} KB · {(typeof textContent === "string" ? textContent : "").split(/\s+/).filter(Boolean).length} words extracted
                        </p>
                      </div>
                      <button
                        onClick={clearUpload}
                        className="text-gray-400 hover:text-white p-1 transition-colors"
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Text preview (read-only, scrollable) */}
                    <div className="relative">
                      <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        className="w-full h-52 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-300 resize-none focus:ring-2 focus:ring-amber-500/50 outline-none"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-500 text-xs rounded">
                          Editable — review and fix if needed
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Paste Mode */}
            {inputMode === "paste" && (
              <div className="relative">
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full h-64 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 resize-none focus:ring-2 focus:ring-amber-500/50 outline-none"
                  placeholder="Paste your textbook content here..."
                />
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-gray-500">
                {typeof textContent === "string" && textContent.length > 0
                  ? `${textContent.split(/\s+/).filter(Boolean).length} words`
                  : "No content yet"}
              </span>
              <button
                onClick={() => setStep(2)}
                disabled={!textContent.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Customize Your Experience</h2>
              <p className="text-gray-400 text-sm">
                Choose how you want to explore this material
              </p>
            </div>

            {/* Student name */}
            <div className="mb-6">
              <label className="block text-sm text-gray-300 mb-2">Your Name (optional)</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full max-w-xs bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                placeholder="Explorer"
              />
            </div>

            {/* Genre selection */}
            <div className="mb-6">
              <label className="block text-sm text-gray-300 mb-3">Experience Type</label>
              <div className="grid grid-cols-5 gap-3">
                {GENRES.map((g) => {
                  const Icon = g.icon;
                  const isSelected = genre === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setGenre(g.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/50"
                          : "border-gray-700 bg-gray-900 hover:border-gray-500"
                      }`}
                    >
                      <Icon
                        size={24}
                        className={isSelected ? "text-amber-400" : "text-gray-400"}
                      />
                      <span
                        className={`text-xs font-medium ${
                          isSelected ? "text-amber-200" : "text-gray-300"
                        }`}
                      >
                        {g.label}
                      </span>
                      <span className="text-xs text-gray-500 text-center leading-tight">
                        {g.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-8">
              <label className="block text-sm text-gray-300 mb-3">Difficulty</label>
              <div className="flex gap-3">
                {DIFFICULTIES.map((d) => {
                  const isSelected = difficulty === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id)}
                      className={`flex-1 p-3 rounded-xl border transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-gray-700 bg-gray-900 hover:border-gray-500"
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          isSelected ? "text-amber-200" : "text-gray-300"
                        }`}
                      >
                        {d.label}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{d.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={startGeneration}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-amber-900/30"
              >
                <Sparkles size={16} /> Generate Experience
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <span>ImmersaLearn — EduX Hackathon 2026</span>
          <span>Powered by Claude AI + Three.js</span>
        </div>
      </footer>
    </div>
  );
}
