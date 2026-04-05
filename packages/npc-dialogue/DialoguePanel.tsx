"use client";
// ============================================
// NPC Dialogue Skill — Drop-in React Component
//
// Self-contained. Only needs Tailwind + lucide-react.
//
// Minimal usage:
//   <DialoguePanel
//     npcName="Professor Colour"
//     npcRole="Art teacher"
//     messages={messages}
//     isLoading={isLoading}
//     onSendMessage={sendMessage}
//     onClose={() => setOpen(false)}
//   />
//
// Or use the pre-wired version with the hook:
//   <NPCDialogue
//     apiEndpoint="/api/npc-chat"
//     character={myNPC}
//     facts={myFacts}
//     scene={myScene}
//     onClose={() => setOpen(false)}
//   />
// ============================================

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, X, Loader2 } from "lucide-react";
import { useNPCDialogue } from "./useNPCDialogue";
import type { NPCCharacter, KnowledgeFact, SceneContext, StudentProgress } from "./types";
import type { DialogueMessage } from "./useNPCDialogue";

// ---- Quick-reply suggestions shown after each NPC message ----
const QUICK_REPLIES = [
  "Tell me more! 🤩",
  "What does that mean? 🤔",
  "Why is that? 💡",
  "That's so cool! ⭐",
];

// ----------------------------------------------------------------
// DialoguePanel — pure presentational component
// Bring-your-own messages + handlers
// ----------------------------------------------------------------

interface DialoguePanelProps {
  npcName: string;
  npcRole?: string;
  /** Avatar colour (Tailwind bg class or hex). Defaults to amber-600. */
  avatarColor?: string;
  messages: DialogueMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClose: () => void;
  /** Override quick-reply buttons. Pass [] to hide them. */
  quickReplies?: string[];
  /** Input placeholder text */
  placeholder?: string;
  className?: string;
}

export function DialoguePanel({
  npcName,
  npcRole,
  avatarColor,
  messages,
  isLoading,
  onSendMessage,
  onClose,
  quickReplies = QUICK_REPLIES,
  placeholder = "Type your own message...",
  className = "",
}: DialoguePanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const avatarStyle = avatarColor?.startsWith("#")
    ? { style: { backgroundColor: avatarColor } }
    : { className: `bg-amber-600` };

  const showQuickReplies = !isLoading && messages.length > 0 && quickReplies.length > 0;

  return (
    <div className={`absolute bottom-4 left-4 right-4 max-w-2xl mx-auto z-50 ${className}`}>
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl overflow-hidden">

        {/* ---- Header ---- */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800/80 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div
              {...(avatarStyle as any)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${!avatarColor?.startsWith("#") ? "bg-amber-600" : ""}`}
            >
              {npcName[0].toUpperCase()}
            </div>
            <div>
              <div className="text-white font-semibold text-sm">{npcName}</div>
              {npcRole && <div className="text-gray-400 text-xs">{npcRole}</div>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
            aria-label="Close dialogue"
          >
            <X size={18} />
          </button>
        </div>

        {/* ---- Messages ---- */}
        <div className="h-64 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && !isLoading && (
            <p className="text-gray-500 text-xs text-center pt-8">
              {npcName} is waiting for you...
            </p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "student" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "student"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-100"
                }`}
              >
                {msg.role === "npc" && (
                  <div className="text-amber-400 text-xs font-semibold mb-1">
                    {msg.npcName ?? npcName}
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                {npcName} is thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ---- Quick-reply suggestions ---- */}
        {showQuickReplies && (
          <div className="flex flex-wrap gap-2 px-3 pt-2 border-t border-gray-700/50">
            {quickReplies.map((text) => (
              <button
                key={text}
                onClick={() => onSendMessage(text)}
                className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-600/30 text-amber-200 text-xs rounded-full transition-colors"
              >
                {text}
              </button>
            ))}
          </div>
        )}

        {/* ---- Text input ---- */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/50 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-colors"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// NPCDialogue — fully wired component (hook + panel in one)
// Drop this in and you're done.
// ----------------------------------------------------------------

interface NPCDialogueProps {
  apiEndpoint?: string;
  character: NPCCharacter;
  facts: KnowledgeFact[];
  scene: SceneContext;
  sceneFactIds?: string[];
  studentProgress?: StudentProgress;
  targetAge?: string;
  onClose: () => void;
  quickReplies?: string[];
  className?: string;
}

export function NPCDialogue({
  apiEndpoint = "/api/npc-chat",
  character,
  facts,
  scene,
  sceneFactIds,
  studentProgress,
  targetAge,
  onClose,
  quickReplies,
  className,
}: NPCDialogueProps) {
  const { messages, isLoading, sendMessage } = useNPCDialogue({
    apiEndpoint,
    character,
    facts,
    scene,
    sceneFactIds,
    studentProgress,
    targetAge,
    autoGreet: true,
  });

  return (
    <DialoguePanel
      npcName={character.name}
      npcRole={character.role}
      messages={messages}
      isLoading={isLoading}
      onSendMessage={sendMessage}
      onClose={onClose}
      quickReplies={quickReplies}
      className={className}
    />
  );
}
