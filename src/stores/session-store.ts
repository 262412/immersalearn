import { create } from "zustand";
import type {
  Script,
  SceneGraph,
  KnowledgeGraph,
  SessionState,
  GenerationProgress,
  VerificationReport,
} from "@/lib/types";

interface AppState {
  // Generation pipeline
  knowledgeGraph: KnowledgeGraph | null;
  script: Script | null;
  verificationReport: VerificationReport | null;
  sceneGraphs: Map<string, SceneGraph>;
  generationProgress: GenerationProgress;

  // Runtime session
  session: SessionState | null;
  currentSceneGraph: SceneGraph | null;

  // UI state
  showDialogue: boolean;
  activeNPC: string | null;
  activeInteraction: string | null;
  isPaused: boolean;

  // Actions - Pipeline
  setKnowledgeGraph: (kg: KnowledgeGraph) => void;
  setScript: (script: Script) => void;
  setVerificationReport: (report: VerificationReport) => void;
  addSceneGraph: (sceneId: string, sg: SceneGraph) => void;
  setGenerationProgress: (progress: GenerationProgress) => void;

  // Actions - Session
  initSession: (scriptId: string, firstActId: string, firstSceneId: string) => void;
  setCurrentScene: (actId: string, sceneId: string) => void;
  setCurrentSceneGraph: (sg: SceneGraph) => void;
  completeInteraction: (interactionId: string) => void;
  collectItem: (itemId: string) => void;
  logChoice: (interactionId: string, choiceId: string) => void;
  addDiscovery: (discoveryId: string) => void;

  // Actions - UI
  openDialogue: (npcId: string) => void;
  closeDialogue: () => void;
  setActiveInteraction: (id: string | null) => void;
  togglePause: () => void;

  // Reset
  reset: () => void;
}

const initialProgress: GenerationProgress = {
  stage: "uploading",
  progress: 0,
  message: "Ready to start",
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  knowledgeGraph: null,
  script: null,
  verificationReport: null,
  sceneGraphs: new Map(),
  generationProgress: initialProgress,
  session: null,
  currentSceneGraph: null,
  showDialogue: false,
  activeNPC: null,
  activeInteraction: null,
  isPaused: false,

  // Pipeline actions
  setKnowledgeGraph: (kg) => set({ knowledgeGraph: kg }),
  setScript: (script) => set({ script }),
  setVerificationReport: (report) => set({ verificationReport: report }),
  addSceneGraph: (sceneId, sg) =>
    set((state) => {
      const next = new Map(state.sceneGraphs);
      next.set(sceneId, sg);
      return { sceneGraphs: next };
    }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),

  // Session actions
  initSession: (scriptId, firstActId, firstSceneId) =>
    set({
      session: {
        script_id: scriptId,
        current_act: firstActId,
        current_scene: firstSceneId,
        completed_interactions: [],
        collected_items: [],
        choices_log: [],
        dialogue_log: [],
        start_time: Date.now(),
        discoveries: [],
      },
    }),

  setCurrentScene: (actId, sceneId) =>
    set((state) => {
      if (!state.session) return {};
      return {
        session: { ...state.session, current_act: actId, current_scene: sceneId },
      };
    }),

  setCurrentSceneGraph: (sg) => set({ currentSceneGraph: sg }),

  completeInteraction: (interactionId) =>
    set((state) => {
      if (!state.session) return {};
      if (state.session.completed_interactions.includes(interactionId)) return {};
      return {
        session: {
          ...state.session,
          completed_interactions: [...state.session.completed_interactions, interactionId],
        },
      };
    }),

  collectItem: (itemId) =>
    set((state) => {
      if (!state.session) return {};
      if (state.session.collected_items.includes(itemId)) return {};
      return {
        session: {
          ...state.session,
          collected_items: [...state.session.collected_items, itemId],
        },
      };
    }),

  logChoice: (interactionId, choiceId) =>
    set((state) => {
      if (!state.session) return {};
      return {
        session: {
          ...state.session,
          choices_log: [
            ...state.session.choices_log,
            { interaction_id: interactionId, choice_id: choiceId, timestamp: Date.now() },
          ],
        },
      };
    }),

  addDiscovery: (discoveryId) =>
    set((state) => {
      if (!state.session) return {};
      if (state.session.discoveries.includes(discoveryId)) return {};
      return {
        session: {
          ...state.session,
          discoveries: [...state.session.discoveries, discoveryId],
        },
      };
    }),

  // UI actions
  openDialogue: (npcId) => set({ showDialogue: true, activeNPC: npcId }),
  closeDialogue: () => set({ showDialogue: false, activeNPC: null }),
  setActiveInteraction: (id) => set({ activeInteraction: id }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  // Reset
  reset: () =>
    set({
      knowledgeGraph: null,
      script: null,
      verificationReport: null,
      sceneGraphs: new Map(),
      generationProgress: initialProgress,
      session: null,
      currentSceneGraph: null,
      showDialogue: false,
      activeNPC: null,
      activeInteraction: null,
      isPaused: false,
    }),
}));
