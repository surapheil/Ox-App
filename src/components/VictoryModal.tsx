import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, RotateCcw, Share2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VictoryModalProps {
  beerCount: number;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  beerCount,
  onRestart,
}) => {
  useEffect(() => {
    // Grand finale confetti bursts
    const end = Date.now() + 2.5 * 1000;
    const colors = ["#F59E0B", "#FCD34D", "#10B981", "#3B82F6", "#EC4899"];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-stone-950 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 text-center shadow-[0_20px_70px_rgba(212,175,55,0.4)] overflow-hidden"
        >
          {/* Amber glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/30 rounded-full blur-3xl pointer-events-none" />

          {/* Habesha Logo & Medallion */}
          <div className="flex flex-col items-center justify-center gap-2 mb-3">
            <div className="relative w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow-[0_0_20px_rgba(212,175,55,0.5)]">
              <img
                src="/assets/aistudio/Top_Logo_36f2e7cb.png"
                alt="Habesha Emblem"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <img
              src="/assets/aistudio/Habesha_text_79f26b7d.png"
              alt="Habesha Beer"
              className="h-7 object-contain drop-shadow"
            />
          </div>

          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              ፍጹም ድል! (10/10 COMPLETE!)
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ዋና የሥጋ ሊቅ እና የሐበሻ ጀግና!
          </h2>
          <p className="text-amber-300 font-bold text-sm mt-1">
            ሁሉንም 10 የበሬ ሥጋ ክፍሎች በትክክል ገምተዋል!
          </p>

          <p className="text-stone-300 text-xs sm:text-sm mt-3 leading-relaxed">
            እንኳን ደስ አለዎት! ሙሉውን የ10 ቀዝቃዛ <strong className="text-amber-300 font-bold">ሐበሻ ቢራ</strong> ሳጥን አሸንፈዋል! 🍻 የሚያረካ! የኢትዮጵያ ባህላዊ የሥጋ አቆራረጥ እውቀትዎ ወደር የለውም።
          </p>

          {/* 10 Beers visual */}
          <div className="my-5 p-3.5 rounded-2xl bg-stone-900 border border-amber-500/30 flex items-center justify-center gap-1.5 text-2xl shadow-inner">
            🍺 🍺 🍺 🍺 🍺 🍺 🍺 🍺 🍺 🍺
          </div>

          <button
            onClick={onRestart}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-black text-sm sm:text-base shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>አዲስ ጨዋታ ጀምር (Play Again)</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
