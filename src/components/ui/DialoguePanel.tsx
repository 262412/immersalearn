"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Loader2 } from "lucide-react";

interface Message {
  role: "npc" | "student";
  content: string;
  npcName?: string;
}

interface DialoguePanelProps {
  npcName: string;
  npcRole: string;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClose: () => void;
}

export function DialoguePanel({
  npcName,
  npcRole,
  messages,
  isLoading,
  onSendMessage,
  onClose,
}: DialoguePanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 max-w-2xl mx-auto z-50">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800/80 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-lg">
              {npcName[0]}
            </div>
            <div>
              <div className="text-white font-semibold text-sm">{npcName}</div>
              <div className="text-gray-400 text-xs">{npcRole}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto p-4 space-y-3">
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
                    {msg.npcName || npcName}
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

        {/* Quick response buttons (for young children who can't type) */}
        {!isLoading && messages.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-3 border-t border-gray-700">
            {["Tell me more! 🤩", "What does that mean? 🤔", "What should I do? 🗺️", "That's so cool! ⭐"].map((text) => (
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

        {/* Text input (for older children who can type) */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 p-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Or type your own message..."
            className="flex-1 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/50 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
