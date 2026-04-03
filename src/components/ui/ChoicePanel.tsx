"use client";

import { useState } from "react";
import { Check, X, RefreshCw } from "lucide-react";
import type { ChoiceContent, ChoiceOption } from "@/lib/types/script";

interface ChoicePanelProps {
  interaction: ChoiceContent;
  onComplete: (selectedIds: string[]) => void;
  onClose: () => void;
}

export function ChoicePanel({
  interaction,
  onComplete,
  onClose,
}: ChoicePanelProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const maxSelect = interaction.max_select || 1;
  const minSelect = interaction.min_select || 1;

  const toggleOption = (id: string) => {
    if (submitted) return;

    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      if (next.size >= maxSelect) {
        // Replace oldest if at max
        if (maxSelect === 1) {
          next.clear();
        } else {
          return;
        }
      }
      next.add(id);
    }
    setSelected(next);
  };

  const handleSubmit = () => {
    if (selected.size < minSelect) return;

    setSubmitted(true);
    setShowResults(true);

    // Check correctness
    const selectedOptions = interaction.options.filter((o) => selected.has(o.id));
    const allCorrect = selectedOptions.every((o) => o.correct);
    const anyWrong = selectedOptions.some((o) => !o.correct);

    if (allCorrect && !anyWrong) {
      setFeedback("Excellent choice!");
    } else {
      const wrongOption = selectedOptions.find((o) => !o.correct);
      setFeedback(wrongOption?.feedback || "Not quite right. Think about it again.");
    }
  };

  const handleRetry = () => {
    setSelected(new Set());
    setSubmitted(false);
    setFeedback(null);
    setShowResults(false);
  };

  const handleContinue = () => {
    onComplete(Array.from(selected));
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900/95 rounded-xl border border-gray-700 shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-700">
          <h3 className="text-white font-semibold text-base">
            {interaction.prompt}
          </h3>
          {maxSelect > 1 && (
            <p className="text-gray-400 text-xs mt-1">
              Select {minSelect === maxSelect ? minSelect : `${minSelect}-${maxSelect}`} option{maxSelect > 1 ? "s" : ""}
              {" "}({selected.size}/{maxSelect} selected)
            </p>
          )}
        </div>

        {/* Options */}
        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {interaction.options.map((option) => {
            const isSelected = selected.has(option.id);
            const showCorrectness = showResults;

            let borderColor = "border-gray-600";
            let bgColor = "bg-gray-800/50";

            if (isSelected && !showCorrectness) {
              borderColor = "border-amber-500";
              bgColor = "bg-amber-500/10";
            } else if (showCorrectness && isSelected) {
              borderColor = option.correct ? "border-green-500" : "border-red-500";
              bgColor = option.correct ? "bg-green-500/10" : "bg-red-500/10";
            } else if (showCorrectness && option.correct) {
              borderColor = "border-green-500/50";
              bgColor = "bg-green-500/5";
            }

            return (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border ${borderColor} ${bgColor} transition-all hover:border-amber-400/50 disabled:cursor-default`}
                disabled={submitted}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-100 text-sm">{option.label}</span>
                  {showCorrectness && isSelected && (
                    option.correct ? (
                      <Check size={16} className="text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <X size={16} className="text-red-400 shrink-0 mt-0.5" />
                    )
                  )}
                </div>
                {showCorrectness && (isSelected || option.correct) && (
                  <p className="text-gray-400 text-xs mt-2">{option.feedback}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mx-4 mb-3 px-4 py-2 rounded-lg text-sm ${
            feedback.includes("Excellent") ? "bg-green-900/50 text-green-300" : "bg-amber-900/50 text-amber-300"
          }`}>
            {feedback}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-700">
          {submitted && interaction.allow_retry && !feedback?.includes("Excellent") && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          )}
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={selected.size < minSelect}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              Confirm
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
