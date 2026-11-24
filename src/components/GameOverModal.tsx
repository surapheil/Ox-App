import React from "react";
import { OxCut } from "../oxCutsData";
import { RotateCcw, HeartHandshake, Eye, BookOpen, UtensilsCrossed } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GameOverModalProps {
  cut: OxCut;
  userAnswer: string;
  beerCount: number;
  onRestart: () => void;
  onContinueReview: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  cut,
  userAnswer,
  beerCount,
  onRestart,
  onContinueReview,
}) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-stone-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden"
        >
          {/* Subtle warm glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Habesha brand watermark / logo */}
          <div className="flex justify-center mb-2">
            <img
              src="/assets/aistudio/Top_Logo_36f2e7cb.png"
              alt="Habesha Emblem"
              className="w-12 h-12 rounded-full p-0.5 border border-amber-400/40 opacity-80"
            />
          </div>

          {/* Gentle Header */}
          <h2 className="text-2xl font-black text-stone-100 tracking-tight">
            በዚህ ዙር አልተሳካም
          </h2>
          <p className="text-stone-400 text-xs mt-1 leading-relaxed">
            አይዞህ ወዳጄ! በቀጣዩ ዙር ቀዝቃዛ ሐበሻ ቢራ ታሸንፋለህ!
          </p>

          {/* Comparison Card: Selected vs Correct Answer */}
          <div className="mt-4 p-4 rounded-2xl bg-stone-900/90 border border-stone-800 text-left space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <span className="text-xs text-stone-400">የተመረጠው</span>
              <span className="text-sm font-semibold text-rose-400 line-through">
                {userAnswer}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-semibold">
                ትክክለኛው መልስ (#{cut.id})
              </span>
              <span className="text-xl font-black text-emerald-300">
                {cut.amharicName}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={onRestart}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-lg shadow-amber-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>እንደገና ጀምር</span>
            </button>
            <button
              onClick={onContinueReview}
              className="w-full py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-sm border border-stone-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-stone-400" />
              <span>ተመልከት</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
