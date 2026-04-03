"use client";

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
}: HUDProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
      {/* Top bar */}
      <div className="flex items-start justify-between p-4">
        {/* Scene info (top-left) */}
        <div className="space-y-2 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
            <div className="text-white text-sm font-bold">{sceneName}</div>
          </div>
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-amber-500/20 max-w-xs">
            <div className="text-amber-200 text-xs font-medium">{objective}</div>
          </div>
        </div>

        {/* Stars collected (top-right) */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-yellow-500/20 flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <span className="text-yellow-300 text-sm font-bold">
              {interactionsCompleted}/{totalInteractions}
            </span>
          </div>
          {totalItems > 0 && (
            <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-purple-500/20 flex items-center gap-2">
              <span className="text-xl">🔍</span>
              <span className="text-purple-300 text-sm font-bold">
                {itemsCollected}/{totalItems}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center">
        <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
          <span className="text-white/70 text-xs">
            🖱️ Drag to look around · Click on glowing things to explore!
          </span>
        </div>
      </div>
    </div>
  );
}
