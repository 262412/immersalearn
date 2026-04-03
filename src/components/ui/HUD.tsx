"use client";

import { MapPin, Target, Package, Clock } from "lucide-react";

interface HUDProps {
  sceneName: string;
  objective: string;
  itemsCollected: number;
  totalItems: number;
  interactionsCompleted: number;
  totalInteractions: number;
  elapsedMinutes: number;
}

export function HUD({
  sceneName,
  objective,
  itemsCollected,
  totalItems,
  interactionsCompleted,
  totalInteractions,
  elapsedMinutes,
}: HUDProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
      {/* Top bar */}
      <div className="flex items-start justify-between p-4">
        {/* Scene info (top-left) */}
        <div className="space-y-2 pointer-events-auto">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-amber-400" />
              <span className="text-white text-sm font-medium">{sceneName}</span>
            </div>
          </div>

          {/* Current objective */}
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-700/30 max-w-xs">
            <div className="flex items-start gap-2">
              <Target size={14} className="text-blue-400 shrink-0 mt-0.5" />
              <span className="text-blue-200 text-xs">{objective}</span>
            </div>
          </div>
        </div>

        {/* Stats (top-right) */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Timer */}
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-gray-400" />
              <span className="text-gray-300 text-xs font-mono">
                {elapsedMinutes}m
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50">
            <div className="flex items-center gap-1.5">
              <Package size={12} className="text-amber-400" />
              <span className="text-amber-200 text-xs">
                {itemsCollected}/{totalItems}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50">
            <div className="flex items-center gap-1.5">
              <span className="text-green-400 text-xs">✓</span>
              <span className="text-green-200 text-xs">
                {interactionsCompleted}/{totalInteractions}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-700/30">
          <span className="text-gray-400 text-xs">
            WASD to move · Click on characters and objects to interact · ESC to unlock cursor
          </span>
        </div>
      </div>
    </div>
  );
}
