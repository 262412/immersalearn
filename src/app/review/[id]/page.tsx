"use client";

import { useAppStore } from "@/stores/session-store";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  BookOpen,
  Brain,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export default function ReviewPage() {
  const router = useRouter();
  const { worldPlan } = useAppStore();

  if (!worldPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">No plan to review. Generate one first.</p>
      </div>
    );
  }

  const { knowledge, narrative } = worldPlan;

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold">Teacher Review</h1>
              <p className="text-xs text-gray-400">{narrative.title}</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/experience/${worldPlan.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg"
          >
            Approve & Launch <ChevronRight size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Scenes */}
          <div className="col-span-2 space-y-6">
            {/* Characters */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h2 className="text-sm font-semibold mb-3">Characters</h2>
              <div className="grid grid-cols-2 gap-3">
                {narrative.characters.map((c) => (
                  <div key={c.id} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-sm font-medium text-amber-300">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.role} — {c.personality}</div>
                    <div className="text-xs text-gray-500 mt-1">Knows: {c.knowledge_facts.length} facts</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scenes */}
            {narrative.scenes.map((scene) => (
              <div key={scene.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <h2 className="text-base font-semibold mb-1">{scene.title}</h2>
                <p className="text-xs text-gray-400 mb-3">
                  {scene.world.environment_type} · {scene.world.time_of_day} · {scene.world.atmosphere}
                </p>
                <p className="text-sm text-gray-300 mb-2">{scene.story.description}</p>
                <p className="text-xs text-blue-300 mb-3">Objective: {scene.story.objective}</p>

                {/* Interactions */}
                <div className="space-y-2">
                  {scene.interactions.map((inter) => (
                    <div key={inter.id} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-300">
                          [{inter.type}] {inter.description}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/30 text-purple-300">
                          {inter.pedagogy_method.replace(/_/g, " ")}
                        </span>
                      </div>
                      {inter.pedagogy_rationale && (
                        <p className="text-xs text-gray-500 mt-1">{inter.pedagogy_rationale}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* World items */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <span className="text-xs text-gray-500">
                    World: {scene.world.landmarks.length} landmarks · {scene.world.npc_placements.length} NPCs · {scene.world.interactive_items.length} items
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Knowledge */}
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 sticky top-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
                <BookOpen size={16} className="text-green-400" />
                Learning Objectives
              </h2>
              {knowledge.learning_objectives.map((lo) => (
                <div key={lo.id} className="flex items-start gap-2 mb-3">
                  <CheckCircle size={14} className="text-green-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-300">{lo.text}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
                <Brain size={16} className="text-purple-400" />
                Facts ({knowledge.facts.length})
              </h2>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {knowledge.facts.map((f) => (
                  <div key={f.id} className="text-xs text-gray-400 p-2 bg-gray-800/30 rounded">
                    <span className="text-gray-500">[{f.id}]</span> {f.statement}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-sm font-semibold mb-3">Summary</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Scenes</span>
                  <span className="text-white">{narrative.scenes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Characters</span>
                  <span className="text-white">{narrative.characters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Facts</span>
                  <span className="text-white">{knowledge.facts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Genre</span>
                  <span className="text-amber-300">{narrative.genre}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
