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
    worldPlan,
    currentSceneGraph,
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

  // Derive script-like data from WorldPlan
  const characters = worldPlan?.narrative.characters || [];
  const facts = worldPlan?.knowledge.facts || [];
  const currentWorldScene = worldPlan?.narrative.scenes.find(
    (s) => s.id === session?.current_scene
  ) || worldPlan?.narrative.scenes[0];

  const elapsedMinutes = session
    ? Math.floor((Date.now() - session.start_time) / 60000)
    : 0;

  // NPC interaction handler
  const handleNPCInteract = useCallback(
    async (npcId: string) => {
      if (!worldPlan || !currentWorldScene) return;

      const npcInstance = (currentSceneGraph?.npcs || []).find((n) => n.id === npcId);

      // Flexible character matching: by character_ref, by id, or by name
      const character = characters.find(
        (c) =>
          c.id === npcInstance?.character_ref ||
          c.id === npcId ||
          c.name === npcInstance?.name
      ) || (characters.length > 0 ? characters[0] : null);

      if (!character) return;

      // Unlock pointer so user can type in dialogue
      document.exitPointerLock();
      store.openDialogue(npcId);

      // Build a script-like character for the chat API
      const chatCharacter = {
        id: character.id,
        name: character.name,
        role: character.role,
        personality: character.personality,
        appearance: character.appearance,
        speech_style: character.speech_style,
        knowledge_role: character.role,
      };

      // Build a minimal knowledge graph for the chat API
      const chatKG = {
        id: worldPlan.id,
        subject: worldPlan.knowledge.subject,
        curriculum: worldPlan.knowledge.curriculum || "",
        topic: worldPlan.knowledge.topic,
        learning_objectives: [],
        facts: facts.map((f) => ({
          ...f,
          linked_objectives: [],
          confidence: "verified" as const,
          source_quote: "",
        })),
        relationships: [],
        key_figures: [],
        key_events: [],
        key_concepts: [],
      };

      const sceneFactIds = character.knowledge_facts || [];

      setIsDialogueLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "[Student approaches and makes eye contact]",
            character: chatCharacter,
            knowledgeGraph: chatKG,
            currentScene: {
              id: currentWorldScene.id,
              description: currentWorldScene.story.description,
              objective: currentWorldScene.story.objective,
            },
            conversationHistory: [],
            studentProgress: {
              completed_interactions: session?.completed_interactions || [],
              discoveries: session?.discoveries || [],
              current_objective: currentWorldScene.story.objective,
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
          { role: "npc", content: "Hello there!", npcName: character.name },
        ]);
      }
      setIsDialogueLoading(false);
    },
    [worldPlan, characters, facts, currentWorldScene, currentSceneGraph, session, store]
  );

  // Send message to NPC
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!worldPlan || !currentWorldScene || !activeNPC) return;

      const npcInstance = (currentSceneGraph?.npcs || []).find((n) => n.id === activeNPC);
      const character = characters.find(
        (c) => c.id === npcInstance?.character_ref || c.id === activeNPC || c.name === npcInstance?.name
      ) || characters[0];

      if (!character) return;

      setDialogueMessages((prev) => [...prev, { role: "student", content: message }]);
      setIsDialogueLoading(true);

      try {
        const history = dialogueMessages.map((m) => ({
          role: m.role === "npc" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            character: {
              id: character.id,
              name: character.name,
              role: character.role,
              personality: character.personality,
              appearance: character.appearance,
              speech_style: character.speech_style,
              knowledge_role: character.role,
            },
            knowledgeGraph: {
              id: worldPlan.id,
              subject: worldPlan.knowledge.subject,
              curriculum: "",
              topic: worldPlan.knowledge.topic,
              learning_objectives: [],
              facts: facts.map((f) => ({ ...f, linked_objectives: [], confidence: "verified" as const })),
              relationships: [],
              key_figures: [],
              key_events: [],
              key_concepts: [],
            },
            currentScene: {
              id: currentWorldScene.id,
              description: currentWorldScene.story.description,
              objective: currentWorldScene.story.objective,
            },
            conversationHistory: history,
            studentProgress: {
              completed_interactions: session?.completed_interactions || [],
              discoveries: session?.discoveries || [],
              current_objective: currentWorldScene.story.objective,
            },
            sceneFactIds: character.knowledge_facts || [],
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
          { role: "npc", content: "Hmm, let me think...", npcName: character.name },
        ]);
      }
      setIsDialogueLoading(false);
    },
    [worldPlan, characters, facts, currentWorldScene, currentSceneGraph, activeNPC, dialogueMessages, session]
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
        // Choice interactions are not yet supported in the new WorldPlan pipeline
        // TODO: implement choice UI from WorldPlan interactions
      }

      store.completeInteraction(objectId);
    },
    [currentSceneGraph, currentWorldScene, store, handleNPCInteract]
  );

  // Trigger handler
  const handleTriggerActivated = useCallback(
    (triggerId: string) => {
      // Handle trigger-based events
    },
    []
  );

  // onClick events now handled directly on 3D meshes via R3F (no pointer lock)

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
  if (!currentSceneGraph || !worldPlan || !session) {
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

  const totalInteractions = currentWorldScene?.interactions.length || 0;
  const completedInteractions = session.completed_interactions.length;
  const totalItems = currentWorldScene?.world.interactive_items.length || 0;

  // Build narration data from WorldPlan
  const narrationSetting = currentWorldScene
    ? `${currentWorldScene.world.environment_type} · ${currentWorldScene.world.time_of_day}`
    : "A new scene";
  const narrationCharacters = characters.map((c) => ({ name: c.name, role: c.role }));

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Narration Overlay — shows on scene load */}
      {showNarration && currentWorldScene && (
        <NarrationOverlay
          title={worldPlan.narrative.title || "Scene"}
          setting={narrationSetting}
          description={currentWorldScene.story.description || "You enter a new area..."}
          objective={currentWorldScene.story.objective || "Explore and discover"}
          characters={narrationCharacters}
          onDismiss={() => setShowNarration(false)}
        />
      )}

      {/* 3D Scene */}
      <SceneRenderer
        sceneGraph={currentSceneGraph}
        onNPCInteract={handleNPCInteract}
        onObjectInteract={handleObjectInteract}
      />

      {/* HUD Overlay */}
      <HUD
        sceneName={currentWorldScene?.title || worldPlan.narrative.title || "Scene"}
        objective={currentWorldScene?.story.objective || "Explore the area"}
        itemsCollected={session.discoveries.length}
        totalItems={Math.max(totalItems, session.discoveries.length)}
        interactionsCompleted={completedInteractions}
        totalInteractions={totalInteractions}
        elapsedMinutes={elapsedMinutes}
      />

      {/* Dialogue Panel */}
      {showDialogue && activeNPC && (() => {
        const npcInst = (currentSceneGraph?.npcs || []).find((n) => n.id === activeNPC);
        const char = characters.find((c) => c.id === npcInst?.character_ref || c.name === npcInst?.name) || characters[0];
        return (
          <DialoguePanel
            npcName={char?.name || npcInst?.name || "NPC"}
            npcRole={char?.role || ""}
            messages={dialogueMessages}
            isLoading={isDialogueLoading}
            onSendMessage={handleSendMessage}
            onClose={handleCloseDialogue}
          />
        );
      })()}

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
