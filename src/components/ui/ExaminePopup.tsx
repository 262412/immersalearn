"use client";

import { X, BookOpen } from "lucide-react";

interface ExaminePopupProps {
  title: string;
  description: string;
  image?: string;
  knowledgeTag?: string;
  onClose: () => void;
  onCollect?: () => void;
}

export function ExaminePopup({
  title,
  description,
  knowledgeTag,
  onClose,
  onCollect,
}: ExaminePopupProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-gray-900/95 rounded-xl border border-amber-700/50 shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-amber-900/30 border-b border-amber-700/30">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <h3 className="text-amber-200 font-semibold text-sm">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-200 text-sm leading-relaxed">{description}</p>

          {/* Knowledge badge */}
          {knowledgeTag && (
            <div className="mt-3 flex items-center gap-2 bg-blue-900/30 border border-blue-700/30 rounded-lg px-3 py-2">
              <BookOpen size={14} className="text-blue-400 shrink-0" />
              <span className="text-blue-300 text-xs">{knowledgeTag}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-700">
          {onCollect && (
            <button
              onClick={() => {
                onCollect();
                onClose();
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded-lg transition-colors"
            >
              📦 Collect
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
