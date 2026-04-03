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
  XCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export default function ReportPage() {
  const router = useRouter();
  const { script, session, knowledgeGraph } = useAppStore();

  if (!script || !session || !knowledgeGraph) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">No learning data available.</p>
      </div>
    );
  }

  const elapsedMinutes = Math.floor(
    (Date.now() - session.start_time) / 60000
  );

  // Calculate stats
  const totalInteractions = script.acts.reduce(
    (sum, act) =>
      sum + act.scenes.reduce((s, scene) => s + scene.interactions.length, 0),
    0
  );

  const correctChoices = session.choices_log.filter((choice) => {
    for (const act of script.acts) {
      for (const scene of act.scenes) {
        for (const interaction of scene.interactions) {
          if (
            interaction.id === choice.interaction_id &&
            interaction.content.type === "choice"
          ) {
            const opt = (interaction.content as any).options?.find(
              (o: any) => o.id === choice.choice_id
            );
            return opt?.correct;
          }
        }
      }
    }
    return false;
  });

  const overallScore = Math.round(
    ((session.completed_interactions.length / Math.max(totalInteractions, 1)) *
      50 +
      (correctChoices.length / Math.max(session.choices_log.length, 1)) *
        50)
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold">Learning Report</h1>
              <p className="text-xs text-gray-400">{script.meta.title}</p>
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
        {/* Score Hero */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
            <Trophy size={40} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-1">{overallScore}%</h2>
          <p className="text-gray-400">
            {overallScore >= 80
              ? "Excellent work! You have a strong understanding."
              : overallScore >= 60
                ? "Good progress! Some areas could use review."
                : "Keep exploring! There's more to discover."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
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
            <div className="text-xs text-gray-400">Interactions</div>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
            <CheckCircle size={20} className="mx-auto text-amber-400 mb-2" />
            <div className="text-xl font-bold">
              {correctChoices.length}/{session.choices_log.length}
            </div>
            <div className="text-xs text-gray-400">Correct Choices</div>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
            <Brain size={20} className="mx-auto text-purple-400 mb-2" />
            <div className="text-xl font-bold">{session.discoveries.length}</div>
            <div className="text-xs text-gray-400">Discoveries</div>
          </div>
        </div>

        {/* Learning Objectives Coverage */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          <h3 className="text-base font-semibold mb-4">
            Knowledge Coverage
          </h3>
          <div className="space-y-4">
            {knowledgeGraph.learning_objectives.map((lo) => {
              const coverage =
                script.alignment_report?.objective_coverage?.[lo.id];
              const sceneInteractions = coverage?.scene_ids || [];
              const completed = sceneInteractions.filter((id) =>
                session.completed_interactions.some((ci) => ci.includes(id))
              ).length;
              const total = coverage?.interaction_count || 1;
              const pct = Math.round((completed / total) * 100);

              return (
                <div key={lo.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{lo.text}</span>
                    <span
                      className={`text-xs font-medium ${
                        pct >= 75
                          ? "text-green-400"
                          : pct >= 40
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {pct >= 75 ? "Mastered" : pct >= 40 ? "Partial" : "Needs Review"}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 75
                          ? "bg-green-500"
                          : pct >= 40
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Choices Review */}
        {session.choices_log.length > 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-base font-semibold mb-4">Your Decisions</h3>
            <div className="space-y-3">
              {session.choices_log.map((choice, idx) => {
                const isCorrect = correctChoices.some(
                  (c) =>
                    c.interaction_id === choice.interaction_id &&
                    c.choice_id === choice.choice_id
                );

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      isCorrect ? "bg-green-900/20" : "bg-red-900/20"
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm text-gray-200">
                        Choice: {choice.choice_id}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        In interaction {choice.interaction_id}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
