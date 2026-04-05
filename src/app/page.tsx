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
  { id: "adventure" as const, label: "Adventure", icon: Sword, desc: "Go on a fun journey!" },
  { id: "mystery" as const, label: "Mystery", icon: Search, desc: "Find clues and solve puzzles!" },
  { id: "simulation" as const, label: "Simulation", icon: Gamepad2, desc: "Try things and see what happens!" },
  { id: "roleplay" as const, label: "Role-Play", icon: Users, desc: "Pretend to be someone cool!" },
  { id: "documentary" as const, label: "Explorer", icon: Film, desc: "Discover amazing things!" },
];

const DIFFICULTIES = [
  { id: "easy" as const, label: "Beginner (K-2)", desc: "Lots of help, simple words" },
  { id: "medium" as const, label: "Explorer (3-4)", desc: "Some help, a bit more to think about" },
  { id: "hard" as const, label: "Challenger (5-6)", desc: "Less help, bigger challenges" },
];

// ---- Subject Presets & Curriculum Options (Primary School) ----
const SUBJECT_PRESETS = [
  { id: "art", label: "Art & Craft", curricula: ["KS1 Art (Ages 5-7)", "KS2 Art (Ages 7-11)", "Primary Art General", "Montessori Art"] },
  { id: "math", label: "Maths", curricula: ["KS1 Maths (Ages 5-7)", "KS2 Maths (Ages 7-11)", "Primary Maths General", "Singapore Maths"] },
  { id: "science", label: "Science", curricula: ["KS1 Science (Ages 5-7)", "KS2 Science (Ages 7-11)", "Primary Science General", "NGSS Elementary"] },
  { id: "history", label: "History", curricula: ["KS1 History (Ages 5-7)", "KS2 History (Ages 7-11)", "Primary History General"] },
  { id: "geography", label: "Geography", curricula: ["KS1 Geography (Ages 5-7)", "KS2 Geography (Ages 7-11)", "Primary Geography General"] },
  { id: "english", label: "English / Reading", curricula: ["KS1 English (Ages 5-7)", "KS2 English (Ages 7-11)", "Primary Literacy General"] },
  { id: "music", label: "Music", curricula: ["KS1 Music (Ages 5-7)", "KS2 Music (Ages 7-11)", "Primary Music General"] },
  { id: "nature", label: "Nature & Animals", curricula: ["KS1 Living Things", "KS2 Living Things", "Primary Nature Study"] },
  { id: "other", label: "Other", curricula: ["Custom"] },
];

// ---- Demo Texts (multi-subject) ----
const DEMOS: Record<string, { subject: string; topic: string; curriculum: string; text: string }> = {
  art: {
    subject: "Art & Craft", topic: "Colours and Painting", curriculum: "KS1 Art (Ages 5-7)",
    text: `Colours and Painting for Kids

Primary Colours:
There are three primary colours: red, blue, and yellow. These are special because you cannot make them by mixing other colours — but you can mix them to make new colours!

Mixing Colours:
- Red + Blue = Purple
- Blue + Yellow = Green
- Red + Yellow = Orange
These new colours are called secondary colours.

Warm and Cool Colours:
- Warm colours are red, orange, and yellow. They remind us of fire and sunshine. They can make a painting feel happy or exciting.
- Cool colours are blue, green, and purple. They remind us of water and ice. They can make a painting feel calm or peaceful.

Famous Artists Who Loved Colour:
- Vincent van Gogh painted "Starry Night" using swirling blues and bright yellows. He used thick paint you can almost feel!
- Claude Monet painted water lilies in his garden. He used soft colours and small dots of paint to show how light changes.
- Frida Kahlo used bright reds, greens, and yellows in her paintings. She often painted pictures of herself with flowers and animals.

Painting Tools:
- Brushes come in different sizes. Big brushes cover large areas. Small brushes are for details.
- You can also paint with sponges, fingers, or even leaves!
- Always clean your brush before using a new colour, or the colours will get muddy.`,
  },
  math: {
    subject: "Maths", topic: "Shapes and Patterns", curriculum: "KS1 Maths (Ages 5-7)",
    text: `Shapes and Patterns

2D Shapes (flat shapes you can draw):
- Circle: perfectly round, like a ball or the sun. It has 0 straight sides and 0 corners.
- Triangle: has 3 straight sides and 3 corners. A slice of pizza is shaped like a triangle!
- Square: has 4 equal sides and 4 corners. All corners are the same. A window can be a square.
- Rectangle: has 4 sides and 4 corners, but two sides are longer than the other two. A door is a rectangle.

3D Shapes (solid shapes you can hold):
- Sphere: shaped like a ball. It is round everywhere.
- Cube: shaped like a dice. It has 6 flat faces, all squares.
- Cylinder: shaped like a tin can. It has 2 circles (top and bottom) and 1 curved side.
- Cone: shaped like an ice cream cone. It has 1 circle at the bottom and a point at the top.

Patterns:
A pattern is something that repeats. For example:
- red, blue, red, blue, red, blue — what comes next? Red!
- circle, square, circle, square — what comes next? Circle!
- 2, 4, 6, 8 — what comes next? 10! (counting by 2s)

Symmetry:
Something has symmetry when one half is a mirror image of the other half. A butterfly has symmetry — both wings look the same! You can test symmetry by folding a shape in half.

Shapes are everywhere! Look around — can you spot circles, squares, and triangles in your classroom?`,
  },
  science: {
    subject: "Science", topic: "The Solar System", curriculum: "KS2 Science (Ages 7-11)",
    text: `Our Solar System

The Sun:
The Sun is a star — a giant ball of hot, glowing gas. It is so big that about 1.3 million Earths could fit inside it! The Sun gives us light and warmth. Without the Sun, Earth would be dark and freezing cold.

The 8 Planets (in order from the Sun):
1. Mercury — the smallest planet and closest to the Sun. It is very hot during the day and very cold at night.
2. Venus — the hottest planet! It is covered in thick clouds that trap heat. It spins backwards compared to most planets.
3. Earth — our home! It is the only planet we know of that has liquid water and living things.
4. Mars — called the Red Planet because its soil contains rusty iron. Scientists have sent robots called rovers to explore it.
5. Jupiter — the biggest planet! It has a Great Red Spot, which is actually a giant storm bigger than Earth.
6. Saturn — famous for its beautiful rings made of ice and rock.
7. Uranus — an ice giant that tilts on its side.
8. Neptune — the farthest planet, very cold and windy.

How to remember the order: My Very Excited Mother Just Served Us Nachos!

The Moon:
Earth has one moon. The Moon orbits (goes around) Earth about once every 27 days. It doesn't make its own light — it reflects light from the Sun. That's why the Moon looks bright at night!

Day and Night:
Earth spins like a top (this is called rotation). One full spin takes 24 hours — that's one day. The side facing the Sun has daytime. The side facing away has nighttime.

A year is how long it takes Earth to go all the way around the Sun — about 365 days.`,
  },
  history: {
    subject: "History", topic: "Ancient Egypt", curriculum: "KS2 History (Ages 7-11)",
    text: `Ancient Egypt — Land of Pharaohs and Pyramids

Where and When:
Ancient Egypt was a civilisation that lasted over 3,000 years, from about 3100 BC to 30 BC. It was in North Africa, along the River Nile. The Nile was very important — its floods brought rich soil for growing food.

Pharaohs:
Pharaohs were the kings and queens of Egypt. People believed pharaohs were part god, part human. Some famous pharaohs:
- Tutankhamun (King Tut): Became pharaoh when he was only 9 years old! His golden tomb was discovered in 1922 by Howard Carter.
- Cleopatra: The last pharaoh of Egypt. She was very clever and could speak nine languages.
- Hatshepsut: One of the few female pharaohs. She built many beautiful temples.

Pyramids:
The pyramids were giant tombs built for pharaohs. The Great Pyramid of Giza is the biggest — it was the tallest building in the world for over 3,800 years! It is made of about 2.3 million stone blocks, each weighing as much as a car.

Mummies:
When important people died, their bodies were preserved as mummies. The Egyptians believed you needed your body in the afterlife. The process took about 70 days!

Hieroglyphics:
Ancient Egyptians used a writing system called hieroglyphics — pictures and symbols instead of letters. There were over 700 different hieroglyphics! We learned to read them thanks to the Rosetta Stone, found in 1799.

Daily Life:
- Children played with dolls, board games, and toy animals
- People kept cats as pets (cats were considered sacred!)
- They ate bread, fish, fruits, and vegetables
- Most clothes were made of white linen because it was so hot`,
  },
  nature: {
    subject: "Nature & Animals", topic: "Life Cycle of a Butterfly", curriculum: "KS1 Living Things",
    text: `The Life Cycle of a Butterfly

Butterflies go through four amazing stages of change, called metamorphosis:

Stage 1 — Egg:
A mother butterfly lays tiny eggs on a leaf. The eggs are very small, about the size of a pinhead. She chooses the leaf carefully — it must be the right kind of plant for her babies to eat! Different butterflies like different plants.

Stage 2 — Caterpillar (Larva):
After a few days, a tiny caterpillar hatches from the egg. The caterpillar is very hungry! It eats and eats and eats the leaves. As it grows bigger, its skin gets too tight, so it sheds its old skin and grows a new one. This happens about 4-5 times. A caterpillar can grow to be 100 times bigger than when it hatched!

Stage 3 — Chrysalis (Pupa):
When the caterpillar is big enough, it hangs upside down from a branch and forms a hard shell around itself called a chrysalis. Inside the chrysalis, something magical happens — the caterpillar's body completely changes! This takes about 10-14 days.

Stage 4 — Butterfly (Adult):
A beautiful butterfly comes out of the chrysalis! At first its wings are wet and crumpled. It has to wait for them to dry and straighten out. Then it can fly! Adult butterflies drink nectar from flowers using a long tongue called a proboscis, which works like a straw.

Fun Facts:
- Butterflies taste with their feet!
- A butterfly's wings are covered in tiny colourful scales
- Monarch butterflies travel over 3,000 miles to find warm weather — that's like flying from London to Egypt!
- There are about 20,000 different kinds of butterflies in the world`,
  },
};

export default function HomePage() {
  const router = useRouter();
  const store = useAppStore();

  const [step, setStep] = useState(1);
  const [textContent, setTextContent] = useState("");
  const [subject, setSubject] = useState("Art & Craft");
  const [topic, setTopic] = useState("");
  const [curriculum, setCurriculum] = useState("KS1 Art (Ages 5-7)");
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
      // Stage 1: Planning (knowledge + narrative + world design)
      setGenerationStage("Creating your adventure...");
      store.setGenerationProgress({
        stage: "planning",
        progress: 20,
        message: "Designing your world and story...",
      });

      // Single unified API call replaces 4 old calls
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textbookContent: textContent,
          preferences: { genre, difficulty, name: studentName || "Explorer" },
          subject,
          topic,
          curriculum,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.worldPlan || !data.sceneGraph) {
        throw new Error(data.error || "Failed to generate experience");
      }

      // Store results
      store.setWorldPlan(data.worldPlan);
      store.addSceneGraph(data.sceneId, data.sceneGraph);
      store.setCurrentSceneGraph(data.sceneGraph);
      store.initSession(data.worldPlan.id, data.sceneId);

      store.setGenerationProgress({
        stage: "ready",
        progress: 100,
        message: "Your world is ready!",
      });

      // Navigate to experience
      router.push(`/experience/${data.worldPlan.id}`);
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
