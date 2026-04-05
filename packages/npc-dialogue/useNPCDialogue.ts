"use client";
// ============================================
// NPC Dialogue Skill — React Hook
//
// Manages conversation state and calls your
// mounted API route automatically.
//
// Usage:
//   const { messages, isLoading, sendMessage, reset } = useNPCDialogue({
//     apiEndpoint: "/api/npc-chat",
//     character: myNPC,
//     facts: myFacts,
//     scene: { description: "...", objective: "..." },
//     autoGreet: true,       // NPC speaks first on mount
//   });
// ============================================

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  NPCCharacter,
  KnowledgeFact,
  SceneContext,
  ConversationMessage,
  StudentProgress,
} from "./types";

export interface DialogueMessage {
  role: "npc" | "student";
  content: string;
  npcName?: string;
}

export interface UseNPCDialogueOptions {
  /** URL of your mounted route.ts, e.g. "/api/npc-chat" */
  apiEndpoint: string;
  character: NPCCharacter;
  facts: KnowledgeFact[];
  scene: SceneContext;
  sceneFactIds?: string[];
  studentProgress?: StudentProgress;
  targetAge?: string;
  /** If true, the NPC sends a greeting message when the hook mounts. Default: true */
  autoGreet?: boolean;
  /** Fallback greeting shown if the API call fails */
  fallbackGreeting?: string;
}

export interface UseNPCDialogueReturn {
  messages: DialogueMessage[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  reset: () => void;
  /** Manually trigger the greeting (useful when autoGreet is false) */
  greet: () => Promise<void>;
}

export function useNPCDialogue(options: UseNPCDialogueOptions): UseNPCDialogueReturn {
  const {
    apiEndpoint,
    character,
    facts,
    scene,
    sceneFactIds,
    studentProgress,
    targetAge,
    autoGreet = true,
    fallbackGreeting = `Hi there! I'm ${options.character.name}. How can I help you?`,
  } = options;

  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasGreeted = useRef(false);

  // Build the conversation history expected by the API
  const buildHistory = useCallback((msgs: DialogueMessage[]): ConversationMessage[] =>
    msgs.map((m) => ({
      role: m.role === "npc" ? "assistant" : "user",
      content: m.content,
    })),
  []);

  const callAPI = useCallback(async (
    message: string,
    history: ConversationMessage[]
  ): Promise<string> => {
    const res = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        character,
        facts,
        scene,
        sceneFactIds,
        conversationHistory: history,
        studentProgress,
        targetAge,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "API error");
    return data.response as string;
  }, [apiEndpoint, character, facts, scene, sceneFactIds, studentProgress, targetAge]);

  const greet = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await callAPI(
        "[The child approaches and looks at you with curious eyes]",
        []
      );
      setMessages([{ role: "npc", content: response, npcName: character.name }]);
    } catch {
      setMessages([{ role: "npc", content: fallbackGreeting, npcName: character.name }]);
    }
    setIsLoading(false);
  }, [callAPI, character.name, fallbackGreeting, isLoading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMsg: DialogueMessage = { role: "student", content: text };
    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const updatedMessages = [...messages, newMsg];
      const history = buildHistory(updatedMessages);
      const response = await callAPI(text, history);
      setMessages((prev) => [
        ...prev,
        { role: "npc", content: response, npcName: character.name },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "npc", content: "Hmm, let me think about that... 🤔", npcName: character.name },
      ]);
    }
    setIsLoading(false);
  }, [messages, isLoading, callAPI, buildHistory, character.name]);

  const reset = useCallback(() => {
    setMessages([]);
    hasGreeted.current = false;
  }, []);

  // Auto-greet on mount
  useEffect(() => {
    if (autoGreet && !hasGreeted.current) {
      hasGreeted.current = true;
      greet();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { messages, isLoading, sendMessage, reset, greet };
}
