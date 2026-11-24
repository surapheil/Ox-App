import React, { useMemo } from "react";
import { OxCut, OX_CUTS } from "../data/oxCuts";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuestionModalProps {
  cut: OxCut;
  onAnswer: (selectedName: string) => void;
  onClose: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  cut,
  onAnswer,
  onClose,
}) => {
  // Generate 4 randomized choices including the correct one
  const choices = useMemo(() => {
    const distractors = OX_CUTS.filter((c) => c.id !== cut.id);
    const shuffled = [...distractors].sort(() => 0.5 - Math.random());
    const selectedDistractors = shuffled.slice(0, 3);
    const combined = [cut, ...selectedDistractors];
    return combined.sort(() => 0.5 - Math.random());
  }, [cut]);

  // Amharic letter indicators: ሀ, ለ, ሐ, መ
  const geezLetters = ["ሀ", "ለ", "ሐ", "መ"];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 28, stiffness: 340 }}
          className="relative w-full sm:max-w-md bg-[#0A0A0D] border-t sm:border border-amber-500/35 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.95)] flex flex-col gap-4"
        >
          {/* Mobile Drag Indicator */}
          <div className="w-10 h-1 bg-amber-500/30 rounded-full mx-auto -mt-1 sm:hidden" />

          {/* Minimalist Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-stone-950 font-mono font-black flex items-center justify-center text-base shadow shrink-0">
                #{cut.id}
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                ክፍል #{cut.id} ማን ይባላል?
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-900 transition"
              aria-label="ዝጋ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amharic-only Choices */}
          <div className="grid grid-cols-1 gap-2.5">
            {choices.map((choice, index) => (
              <button
                key={choice.id}
                onClick={() => onAnswer(choice.amharicName)}
                className="group w-full min-h-[52px] px-4 py-3 rounded-2xl bg-stone-900/80 hover:bg-gradient-to-r hover:from-amber-400 hover:to-yellow-500 hover:text-stone-950 border border-amber-500/20 hover:border-amber-300 text-left transition-all duration-150 flex items-center gap-3.5 active:scale-[0.98]"
              >
                <span className="w-7 h-7 rounded-lg bg-stone-950 text-amber-300 text-xs font-bold flex items-center justify-center font-mono border border-amber-500/30 group-hover:border-stone-900 shrink-0">
                  {geezLetters[index] || index + 1}
                </span>
                <span className="text-base sm:text-lg font-bold text-stone-100 group-hover:text-stone-950 tracking-wide">
                  {choice.amharicName}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
