import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { OxCut, BEER_BRANDS } from "../data/oxCuts";
import { Sparkles, Trophy, UtensilsCrossed, ArrowRight, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BeerAwardModalProps {
  cut: OxCut;
  beerCount: number;
  onNext: () => void;
  onExit?: () => void;
  isGameComplete?: boolean;
}

export const BeerAwardModal: React.FC<BeerAwardModalProps> = ({
  cut,
  beerCount,
  onNext,
  onExit,
  isGameComplete = false,
}) => {
  // Select a fun brand based on the cut's id
  const brand = BEER_BRANDS[(cut.id - 1) % BEER_BRANDS.length];

  useEffect(() => {
    // Fire festive celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#F59E0B", "#D97706", "#FCD34D", "#FFFFFF", "#10B981"],
    });

    if (isGameComplete) {
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
        });
      }, 400);
    }
  }, [isGameComplete]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-stone-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-7 text-center shadow-[0_20px_60px_rgba(212,175,55,0.2)] overflow-hidden"
        >
          {/* Subtle amber radial glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />

          {/* Habesha Beer Award Badge Header */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <img
              src="/assets/aistudio/Habesha_text_79f26b7d.png"
              alt="Habesha Beer"
              className="h-7 object-contain drop-shadow"
            />
          </div>

          {/* Beer Celebration Graphic with Habesha Medallion */}
          <div className="relative mx-auto mb-3 w-32 h-32 flex items-center justify-center">
            {/* Animated Foaming Beer Mug Graphic */}
            <div className="relative">
              {/* Foam Head overflow */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white rounded-full shadow-md z-10 flex items-center justify-center gap-1 border border-amber-100">
                <span className="w-3.5 h-3.5 bg-white rounded-full inline-block" />
                <span className="w-4 h-4 bg-white rounded-full inline-block -mt-1" />
                <span className="w-3.5 h-3.5 bg-white rounded-full inline-block" />
              </div>

              {/* Glass body with amber beer liquid */}
              <div className="w-16 h-20 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 rounded-b-2xl border-2 border-amber-200/90 shadow-lg relative overflow-hidden flex items-center justify-center">
                {/* Habesha Circular Medallion stamped on cold beer glass */}
                <img
                  src="/assets/aistudio/Top_Logo_36f2e7cb.png"
                  alt="Habesha Beer Emblem"
                  className="w-9 h-9 rounded-full object-contain drop-shadow-md z-10 opacity-90"
                />

                {/* Beer bubbles animation */}
                <div className="absolute inset-0 flex justify-around items-end pb-2 opacity-70">
                  <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1 h-1 bg-white/70 rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
                {/* Frost reflection */}
                <div className="absolute left-1.5 top-2 bottom-2 w-1 bg-white/40 rounded-full" />
              </div>

              {/* Mug Handle */}
              <div className="absolute top-4 -right-4 w-5 h-12 border-4 border-amber-200/90 rounded-r-xl" />
            </div>

            {/* Floating Sparkles & Toast */}
            <span className="absolute -top-1 -right-1 text-2xl animate-spin [animation-duration:6s]">
              ✨
            </span>
            <span className="absolute -bottom-1 -left-1 text-2xl">
              🍻
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-black text-white tracking-tight">
            ትክክል! እንኳን ደስ አለዎት 🍻
          </h2>
          <p className="text-amber-300 font-bold text-sm mt-1">
            1 ቀዝቃዛ <strong className="text-amber-200">{brand.name}</strong> ተሸልመዋል!
          </p>

          {/* Minimal Cut Name & Beers Collected */}
          <div className="mt-4 p-3.5 rounded-2xl bg-stone-900/90 border border-amber-500/30 flex items-center justify-between text-left">
            <div>
              <span className="text-[11px] text-stone-400 block">
                ክፍል #{cut.id}
              </span>
              <span className="text-lg font-bold text-emerald-400">
                {cut.amharicName}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-stone-400 block">ቢራ</span>
              <span className="font-bold text-amber-400 font-mono text-base">
                {beerCount} / 10 🍺
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 space-y-2">
            <button
              onClick={onNext}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm shadow-lg shadow-amber-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>
                {isGameComplete ? "የድል ማጠቃለያ" : "ወደ ካርታው ተመለስ · ቀጣይ ክፍል"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onExit && (
              <button
                onClick={onExit}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-amber-500/40 text-amber-300 hover:text-white font-bold text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 text-amber-400" />
                <span>ውጣ / ጨዋታውን አጠናቅቅ</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
