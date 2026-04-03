"use client";

import { useAppStore } from "@/stores/session-store";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trophy,
  Target,
  Brain,
  Clock,
  CheckCircle,
  RotateCcw,
} from "lucide-react";

export default function ReportPage() {
  const router = useRouter();
  const { worldPlan, session } = useAppStore();

  if (!worldPlan || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">No learning data available.</p>
      </div>
    );
  }

  const elapsedMinutes = Math.floor(
    (Date.now() - session.start_time) / 60000
  );

  const objectives = worldPlan.knowledge.learning_objectives;
  const totalInteractions = worldPlan.narrative.scenes.reduce(
    (sum, scene) => sum + scene.interactions.length, 0
  );

  const overallScore = Math.round(
    (session.completed_interactions.length / Math.max(totalInteractions, 1)) * 100
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="text-gray-400 hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold">Learning Report</h1>
              <p className="text-xs text-gray-400">{worldPlan.narrative.title}</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded-lg"
          >
            <RotateCcw size={14} /> New Experience
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Score */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
            <Trophy size={40} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-1">{overallScore}%</h2>
          <p className="text-gray-400">
            {overallScore >= 80
              ? "Amazing job! You're a superstar learner!"
              : overallScore >= 50
                ? "Great work! Keep exploring to learn more!"
                : "Good start! There's so much more to discover!"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
            <Clock size={20} className="mx-auto text-blue-400 mb-2" />
            <div className="text-xl font-bold">{elapsedMinutes}m</div>
            <div className="text-xs text-gray-400">Time Spent</div>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
            <Target size={20} className="mx-auto text-green-400 mb-2" />
            <div className="text-xl font-bold">
              {session.completed_interactions.length}/{totalInteractions}
            </div>
            <div className="text-xs text-gray-400">Things Explored</div>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
            <Brain size={20} className="mx-auto text-purple-400 mb-2" />
            <div className="text-xl font-bold">{session.discoveries.length}</div>
            <div className="text-xs text-gray-400">Discoveries</div>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-base font-semibold mb-4">What You Learned</h3>
          <div className="space-y-3">
            {objectives.map((lo) => (
              <div key={lo.id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-200">{lo.text}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
