"use client";

import { useAppStore } from "@/stores/session-store";
import { Sparkles, CheckCircle, Loader2, AlertCircle } from "lucide-react";

const STAGES = [
  { key: "uploading", label: "Uploading Material", icon: "📄" },
  { key: "planning", label: "Planning Your World", icon: "🧠" },
  { key: "building", label: "Building 3D Scene", icon: "🌍" },
  { key: "assembling", label: "Assembling World", icon: "🔧" },
  { key: "ready", label: "Ready!", icon: "✅" },
];

export default function GeneratePage() {
  const { generationProgress } = useAppStore();
  const currentStage = generationProgress.stage;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-6">
      <div className="w-20 h-20 mb-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center animate-pulse-glow">
        <Sparkles size={32} className="text-white" />
      </div>

      <h1 className="text-2xl font-bold mb-2">Generating Your Experience</h1>
      <p className="text-gray-400 text-sm mb-8">{generationProgress.message}</p>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-700"
            style={{ width: `${generationProgress.progress}%` }}
          />
        </div>
      </div>

      {/* Stage list */}
      <div className="w-full max-w-md space-y-3">
        {STAGES.map((stage) => {
          const stageIndex = STAGES.findIndex((s) => s.key === stage.key);
          const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
          const isComplete = stageIndex < currentIndex || currentStage === "ready";
          const isCurrent = stage.key === currentStage;
          const isPending = stageIndex > currentIndex;

          return (
            <div
              key={stage.key}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isCurrent
                  ? "bg-amber-900/20 border border-amber-700/30"
                  : isComplete
                    ? "bg-green-900/10 border border-green-800/20"
                    : "bg-gray-900/50 border border-gray-800/30"
              }`}
            >
              <span className="text-lg">{stage.icon}</span>
              <span
                className={`flex-1 text-sm ${
                  isCurrent
                    ? "text-amber-200 font-medium"
                    : isComplete
                      ? "text-green-300"
                      : "text-gray-500"
                }`}
              >
                {stage.label}
              </span>
              {isComplete && <CheckCircle size={16} className="text-green-400" />}
              {isCurrent && currentStage !== "ready" && currentStage !== "error" && (
                <Loader2 size={16} className="text-amber-400 animate-spin" />
              )}
              {currentStage === "error" && isCurrent && (
                <AlertCircle size={16} className="text-red-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
