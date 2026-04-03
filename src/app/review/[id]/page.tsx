"use client";

import { useAppStore } from "@/stores/session-store";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  BookOpen,
  Brain,
  Shield,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { PEDAGOGY_METHODS } from "@/lib/pedagogy/methods";
import type { PedagogyMethod } from "@/lib/types";

export default function ReviewPage() {
  const router = useRouter();
  const { script, knowledgeGraph, verificationReport } = useAppStore();

  if (!script || !knowledgeGraph) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">No script to review. Generate one first.</p>
      </div>
    );
  }

  const report = script.alignment_report;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold">Teacher Review</h1>
              <p className="text-xs text-gray-400">{script.meta.title}</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/experience/${script.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Approve & Launch <ChevronRight size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Script Overview */}
          <div className="col-span-2 space-y-6">
            {/* Verification Status */}
            {verificationReport && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
                  <Shield size={16} className="text-blue-400" />
                  Fact Verification Report
                </h2>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {verificationReport.verified}
                    </div>
                    <div className="text-xs text-green-300">Verified</div>
                  </div>
                  <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {verificationReport.flagged}
                    </div>
                    <div className="text-xs text-yellow-300">Flagged</div>
                  </div>
                  <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {verificationReport.rejected}
                    </div>
                    <div className="text-xs text-red-300">Rejected</div>
                  </div>
                </div>

                {/* Flagged items */}
                {verificationReport.items
                  .filter((i) => i.status !== "verified")
                  .slice(0, 5)
                  .map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg mb-2"
                    >
                      {item.status === "flagged" ? (
                        <AlertTriangle size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm text-gray-200">{item.claim}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.reason}</p>
                        {item.suggested_correction && (
                          <p className="text-xs text-blue-300 mt-1">
                            Suggestion: {item.suggested_correction}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Script Scenes */}
            {script.acts.map((act) => (
              <div
                key={act.id}
                className="bg-gray-900 rounded-xl border border-gray-800 p-5"
              >
                <h2 className="text-base font-semibold mb-1">{act.title}</h2>
                <p className="text-xs text-gray-400 mb-4">
                  {act.setting.location} · {act.setting.time_period} · {act.setting.atmosphere}
                </p>

                {act.scenes.map((scene) => (
                  <div
                    key={scene.id}
                    className="ml-4 mb-4 pl-4 border-l-2 border-gray-700"
                  >
                    <h3 className="text-sm font-medium text-amber-300">
                      {scene.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{scene.description}</p>
                    <p className="text-xs text-blue-300 mt-1">
                      Objective: {scene.objective}
                    </p>

                    {/* Interactions */}
                    <div className="mt-3 space-y-2">
                      {scene.interactions.map((interaction) => (
                        <div
                          key={interaction.id}
                          className="bg-gray-800/50 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-300">
                              [{interaction.type}] {interaction.description}
                            </span>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor:
                                  PEDAGOGY_METHODS[interaction.pedagogy.method]
                                    ?.color + "20" || "#33333320",
                                color:
                                  PEDAGOGY_METHODS[interaction.pedagogy.method]
                                    ?.color || "#999",
                              }}
                            >
                              {PEDAGOGY_METHODS[interaction.pedagogy.method]?.icon}{" "}
                              {interaction.pedagogy.method.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {interaction.pedagogy.rationale}
                          </p>
                          {interaction.grounded_facts.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {interaction.grounded_facts.map((fid) => (
                                <span
                                  key={fid}
                                  className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded"
                                >
                                  {fid}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Right: Alignment Report */}
          <div className="space-y-4">
            {/* Curriculum Coverage */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 sticky top-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
                <BookOpen size={16} className="text-green-400" />
                Curriculum Alignment
              </h2>

              {knowledgeGraph.learning_objectives.map((lo) => {
                const coverage = report?.objective_coverage?.[lo.id];
                const quality = coverage?.coverage_quality || "weak";
                const count = coverage?.interaction_count || 0;

                return (
                  <div key={lo.id} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-300 flex-1">
                        {lo.text}
                      </span>
                      {quality === "strong" && (
                        <CheckCircle size={14} className="text-green-400 shrink-0 ml-2" />
                      )}
                      {quality === "adequate" && (
                        <AlertTriangle size={14} className="text-yellow-400 shrink-0 ml-2" />
                      )}
                      {quality === "weak" && (
                        <XCircle size={14} className="text-red-400 shrink-0 ml-2" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            quality === "strong"
                              ? "bg-green-500"
                              : quality === "adequate"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(100, count * 33)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {count} interactions
                      </span>
                    </div>
                  </div>
                );
              })}

              {report?.uncovered_objectives &&
                report.uncovered_objectives.length > 0 && (
                  <div className="mt-4 bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                    <p className="text-xs text-red-300 font-medium mb-1">
                      Uncovered Objectives:
                    </p>
                    {report.uncovered_objectives.map((id) => (
                      <p key={id} className="text-xs text-red-200">
                        · {id}
                      </p>
                    ))}
                  </div>
                )}
            </div>

            {/* Pedagogy Distribution */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
                <Brain size={16} className="text-purple-400" />
                Pedagogy Methods Used
              </h2>

              {report?.pedagogy_distribution &&
                Object.entries(report.pedagogy_distribution).map(
                  ([method, count]) => {
                    const info =
                      PEDAGOGY_METHODS[method as PedagogyMethod];
                    if (!info) return null;
                    return (
                      <div
                        key={method}
                        className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span>{info.icon}</span>
                          <span className="text-xs text-gray-300">
                            {info.name}
                          </span>
                        </div>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: info.color + "20",
                            color: info.color,
                          }}
                        >
                          {count}x
                        </span>
                      </div>
                    );
                  }
                )}
            </div>

            {/* Stats */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-sm font-semibold mb-3">Summary</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Interactions</span>
                  <span className="text-white">{report?.total_interactions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Facts Referenced</span>
                  <span className="text-white">{report?.total_facts_referenced || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Duration</span>
                  <span className="text-white">{report?.estimated_duration_minutes || 0} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Genre</span>
                  <span className="text-amber-300">{script.meta.genre}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
