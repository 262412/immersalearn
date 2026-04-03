"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

interface NarrationOverlayProps {
  title: string;
  setting: string;
  description: string;
  objective: string;
  characters: { name: string; role: string }[];
  onDismiss: () => void;
}

export function NarrationOverlay({
  title,
  setting,
  description,
  objective,
  characters,
  onDismiss,
}: NarrationOverlayProps) {
  const [phase, setPhase] = useState(0); // 0=setting, 1=story, 2=objective
  const [visible, setVisible] = useState(true);

  // Auto-advance after a delay, or click to advance
  const advance = () => {
    if (phase < 2) {
      setPhase(phase + 1);
    } else {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }
  };

  if (!visible) {
    return (
      <div className="fixed inset-0 z-50 bg-black pointer-events-none transition-opacity duration-500 opacity-0" />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-pointer select-none"
      onClick={advance}
    >
      <div className="max-w-2xl mx-auto px-8 text-center animate-fade-in">
        {phase === 0 && (
          <div key="setting">
            <p className="text-amber-400/60 text-xs uppercase tracking-widest mb-4">
              {setting}
            </p>
            <h1 className="text-3xl font-bold text-white mb-6 leading-tight">
              {title}
            </h1>
            {characters.length > 0 && (
              <div className="flex justify-center gap-4 mb-8">
                {characters.map((c, i) => (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                  >
                    <div className="text-white text-sm font-medium">{c.name}</div>
                    <div className="text-gray-400 text-xs">{c.role}</div>
                  </div>
                ))}
              </div>
            )}
            <ClickHint />
          </div>
        )}

        {phase === 1 && (
          <div key="story">
            <p className="text-gray-300 text-base leading-relaxed mb-8 whitespace-pre-line">
              {description}
            </p>
            <ClickHint />
          </div>
        )}

        {phase === 2 && (
          <div key="objective">
            <p className="text-amber-400/60 text-xs uppercase tracking-widest mb-3">
              Your Objective
            </p>
            <p className="text-amber-200 text-lg font-medium mb-8">
              {objective}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                advance();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
            >
              Enter Scene <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ClickHint() {
  return (
    <p className="text-gray-500 text-xs mt-4 animate-pulse">
      Click anywhere to continue...
    </p>
  );
}
