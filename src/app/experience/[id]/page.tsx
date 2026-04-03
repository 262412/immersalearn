"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppStore } from "@/stores/session-store";
import { DialoguePanel } from "@/components/ui/DialoguePanel";
import { ChoicePanel } from "@/components/ui/ChoicePanel";
import { ExaminePopup } from "@/components/ui/ExaminePopup";
import { NarrationOverlay } from "@/components/ui/NarrationOverlay";
import { HUD } from "@/components/ui/HUD";
import type { ChoiceContent, InteractAction } from "@/lib/types";

// Dynamic import for Three.js (no SSR)
const SceneRenderer = dynamic(
  () =>
    import("@/components/three/SceneRenderer").then((m) => m.SceneRenderer),
  { ssr: false }
);

interface DialogueMessage {
  role: "npc" | "student";
  content: string;
  npcName?: string;
}

export default function ExperiencePage() {
  const store = useAppStore();
  const {
    script,
    currentSceneGraph,
    knowledgeGraph,
    session,
    showDialogue,
    activeNPC,
  } = store;

  const [dialogueMessages, setDialogueMessages] = useState<DialogueMessage[]>([]);
  const [isDialogueLoading, setIsDialogueLoading] = useState(false);
  const [activeChoice, setActiveChoice] = useState<ChoiceContent | null>(null);
  const [activeChoiceInteractionId, setActiveChoiceInteractionId] = useState<string | null>(null);
  const [examinePopup, setExaminePopup] = useState<{
    title: string;
    description: string;
    knowledgeTag?: string;
    onCollect?: () => void;
  } | null>(null);
  const [showNarration, setShowNarration] = useState(true);

  // Get current scene info
  const currentAct = script?.acts.find((a) => a.id === session?.current_act);
  const currentScene = currentAct?.scenes.find(
    (s) => s.id === session?.current_scene
  );

  const elapsedMinutes = session
    ? Math.floor((Date.now() - session.start_time) / 60000)
    : 0;

  // NPC interaction handler
  const handleNPCInteract = useCallback(
    async (npcId: string) => {
      if (!script || !knowledgeGraph || !currentScene) return;

      const npcInstance = (currentSceneGraph?.npcs || []).find((n) => n.id === npcId);

      // Flexible character matching: by character_ref, by id, or by name
      const character = script.characters.find(
        (c) =>
          c.id === npcInstance?.character_ref ||
          c.id === npcId ||
          c.name === npcInstance?.name
      ) || (script.characters.length > 0 ? script.characters[0] : null);

      if (!character) return;

      // Unlock pointer so user can type in dialogue
      document.exitPointerLock();
      store.openDialogue(npcId);

      // Generate greeting
      setIsDialogueLoading(true);
      try {
        const sceneFactIds = currentScene.interactions.flatMap(
          (i) => i.grounded_facts || []
        );

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "[Student approaches and makes eye contact]",
            character,
            knowledgeGraph,
            currentScene: {
              id: currentScene.id,
              description: currentScene.description,
              objective: currentScene.objective,
            },
            conversationHistory: [],
            studentProgress: {
              completed_interactions: session?.completed_interactions || [],
              discoveries: session?.discoveries || [],
              current_objective: currentScene.objective,
            },
            sceneFactIds,
          }),
        });

        const { response } = await res.json();
        setDialogueMessages([
          { role: "npc", content: response, npcName: character.name },
        ]);
      } catch (error) {
        setDialogueMessages([
          {
            role: "npc",
            content: "...",
            npcName: character.name,
          },
        ]);
      }
      setIsDialogueLoading(false);
    },
    [script, knowledgeGraph, currentScene, currentSceneGraph, session, store]
  );

  // Send message to NPC
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!script || !knowledgeGraph || !currentScene || !activeNPC) return;

      const npcInstance = currentSceneGraph?.npcs.find(
        (n) => n.id === activeNPC
      );
      const character = script.characters.find(
        (c) => c.id === npcInstance?.character_ref
      );

      if (!character) return;

      // Add student message
      setDialogueMessages((prev) => [
        ...prev,
        { role: "student", content: message },
      ]);

      setIsDialogueLoading(true);

      try {
        const sceneFactIds = currentScene.interactions.flatMap(
          (i) => i.grounded_facts || []
        );

        const history = dialogueMessages.map((m) => ({
          role: m.role === "npc" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            character,
            knowledgeGraph,
            currentScene: {
              id: currentScene.id,
              description: currentScene.description,
              objective: currentScene.objective,
            },
            conversationHistory: history,
            studentProgress: {
              completed_interactions: session?.completed_interactions || [],
              discoveries: session?.discoveries || [],
              current_objective: currentScene.objective,
            },
            sceneFactIds,
          }),
        });

        const { response } = await res.json();
        setDialogueMessages((prev) => [
          ...prev,
          { role: "npc", content: response, npcName: character.name },
        ]);
      } catch (error) {
        setDialogueMessages((prev) => [
          ...prev,
          { role: "npc", content: "...", npcName: character?.name },
        ]);
      }

      setIsDialogueLoading(false);
    },
    [
      script,
      knowledgeGraph,
      currentScene,
      currentSceneGraph,
      activeNPC,
      dialogueMessages,
      session,
    ]
  );

  // Close dialogue
  const handleCloseDialogue = useCallback(() => {
    store.closeDialogue();
    setDialogueMessages([]);
  }, [store]);

  // Object interaction handler
  const handleObjectInteract = useCallback(
    (objectId: string) => {
      if (!currentSceneGraph) return;

      const objects = currentSceneGraph.interactive_objects || [];
      const obj = objects.find((o) => o.id === objectId);
      if (!obj) return;

      const interaction = obj.interaction || {};
      const action = interaction.on_interact;

      // If no action defined, show a generic examine popup
      if (!action || !action.type) {
        setExaminePopup({
          title: obj.name || "Object",
          description: `You examine the ${obj.name || "object"}.`,
          onCollect: () => { store.addDiscovery(objectId); },
        });
        store.completeInteraction(objectId);
        return;
      }

      if (action.type === "show_panel") {
        setExaminePopup({
          title: action.title,
          description: action.description,
          onCollect: () => {
            store.addDiscovery(objectId);
          },
        });
      } else if (action.type === "collect_item") {
        store.collectItem(action.item_id);
        store.addDiscovery(objectId);
      } else if (action.type === "trigger_dialogue" && action.npc_id) {
        handleNPCInteract(action.npc_id);
      } else if (action.type === "trigger_choice") {
        // Find the choice interaction in the script
        const interaction = currentScene?.interactions.find(
          (i) =>
            i.id === action.choice_interaction_ref &&
            i.content.type === "choice"
        );
        if (interaction && interaction.content.type === "choice") {
          setActiveChoice(interaction.content as ChoiceContent);
          setActiveChoiceInteractionId(interaction.id);
        }
      }

      store.completeInteraction(objectId);
    },
    [currentSceneGraph, currentScene, store, handleNPCInteract]
  );

  // Trigger handler
  const handleTriggerActivated = useCallback(
    (triggerId: string) => {
      // Handle trigger-based events
    },
    []
  );

  // Listen for raycast interaction events from PlayerController
  useEffect(() => {
    const onSceneInteract = (e: Event) => {
      const { type, id } = (e as CustomEvent).detail;
      if (type === "npc") {
        handleNPCInteract(id);
      } else if (type === "object") {
        handleObjectInteract(id);
      }
    };
    window.addEventListener("scene-interact", onSceneInteract);
    return () => window.removeEventListener("scene-interact", onSceneInteract);
  }, [handleNPCInteract, handleObjectInteract]);

  // Choice completion
  const handleChoiceComplete = useCallback(
    (selectedIds: string[]) => {
      if (activeChoiceInteractionId) {
        store.completeInteraction(activeChoiceInteractionId);
        selectedIds.forEach((id) => {
          if (activeChoiceInteractionId) {
            store.logChoice(activeChoiceInteractionId, id);
          }
        });
      }
      setActiveChoice(null);
      setActiveChoiceInteractionId(null);
    },
    [activeChoiceInteractionId, store]
  );

  // Loading state
  if (!currentSceneGraph || !script || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-2xl">🌍</span>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Loading World...</h2>
          <p className="text-gray-400 text-sm">Preparing your immersive experience</p>
        </div>
      </div>
    );
  }

  const totalInteractions = currentScene?.interactions.length || 0;
  const completedInteractions = session.completed_interactions.filter((id) =>
    currentScene?.interactions.some((i) => i.id === id)
  ).length;

  // Count discoverable items
  const totalItems = currentScene?.interactions
    .filter((i) => i.type === "explore")
    .reduce((sum, i) => {
      if (i.content.type === "explore") {
        return sum + (i.content as any).discoverable_items?.length || 0;
      }
      return sum;
    }, 0) || 0;

  // Build narration data from script
  const narrationSetting = currentAct?.setting
    ? `${currentAct.setting.location || ""} · ${currentAct.setting.time_period || ""}`
    : "A new scene";
  const narrationCharacters = (script.characters || [])
    .filter((c) =>
      (currentScene?.npcs_present || []).includes(c.id) ||
      (currentScene?.npcs_present || []).length === 0
    )
    .map((c) => ({ name: c.name, role: c.role }));

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Narration Overlay — shows on scene load */}
      {showNarration && currentScene && (
        <NarrationOverlay
          title={currentAct?.title || script.meta.title || "Scene"}
          setting={narrationSetting}
          description={currentScene.description || "You enter a new area..."}
          objective={currentScene.objective || "Explore and discover"}
          characters={narrationCharacters}
          onDismiss={() => setShowNarration(false)}
        />
      )}

      {/* 3D Scene */}
      <SceneRenderer
        sceneGraph={currentSceneGraph}
        onNPCInteract={handleNPCInteract}
        onObjectInteract={handleObjectInteract}
        onTriggerActivated={handleTriggerActivated}
      />

      {/* HUD Overlay */}
      <HUD
        sceneName={currentScene?.title || currentAct?.title || "Scene"}
        objective={currentScene?.objective || "Explore the area"}
        itemsCollected={session.discoveries.length}
        totalItems={Math.max(totalItems, session.discoveries.length)}
        interactionsCompleted={completedInteractions}
        totalInteractions={totalInteractions}
        elapsedMinutes={elapsedMinutes}
      />

      {/* Dialogue Panel */}
      {showDialogue && activeNPC && (
        <DialoguePanel
          npcName={
            script.characters.find(
              (c) =>
                c.id ===
                currentSceneGraph.npcs.find((n) => n.id === activeNPC)
                  ?.character_ref
            )?.name || "NPC"
          }
          npcRole={
            script.characters.find(
              (c) =>
                c.id ===
                currentSceneGraph.npcs.find((n) => n.id === activeNPC)
                  ?.character_ref
            )?.role || ""
          }
          messages={dialogueMessages}
          isLoading={isDialogueLoading}
          onSendMessage={handleSendMessage}
          onClose={handleCloseDialogue}
        />
      )}

      {/* Choice Panel */}
      {activeChoice && (
        <ChoicePanel
          interaction={activeChoice}
          onComplete={handleChoiceComplete}
          onClose={() => {
            setActiveChoice(null);
            setActiveChoiceInteractionId(null);
          }}
        />
      )}

      {/* Examine Popup */}
      {examinePopup && (
        <ExaminePopup
          title={examinePopup.title}
          description={examinePopup.description}
          knowledgeTag={examinePopup.knowledgeTag}
          onClose={() => setExaminePopup(null)}
          onCollect={examinePopup.onCollect}
        />
      )}
    </div>
  );
}
