import React from "react";
import { BUTCHER_RANKS, OxCut, OX_CUTS } from "../data/oxCuts";
import { Trophy, Beer, Flame, Award } from "lucide-react";

interface BeerRackProps {
  beerCount: number;
  streak: number;
  revealedCount: number;
  onOpenGuide: () => void;
}

export const BeerRack: React.FC<BeerRackProps> = ({
  beerCount,
  streak,
  revealedCount,
  onOpenGuide,
}) => {
  // Determine user rank based on total beers
  const currentRank = [...BUTCHER_RANKS].reverse().find((r) => beerCount >= r.minBeers) || BUTCHER_RANKS[0];

  return (
    <div className="w-full bg-stone-950/95 border-2 border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.85)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
        {/* User Rank Title with Habesha Medallion */}
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-amber-200 to-yellow-600 shadow-[0_0_15px_rgba(212,175,55,0.4)] shrink-0">
            <img
              src="/assets/aistudio/Top_Logo_36f2e7cb.png"
              alt="Habesha Emblem"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">የክብር ማዕረግ (Rank):</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40">
                {currentRank.titleAm}
              </span>
            </div>
            <p className="text-stone-300 text-xs font-mono">
              {currentRank.titleEn}
            </p>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-2 text-xs">
          {/* Beers Won */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-amber-400/40 text-amber-300 font-bold shadow-sm">
            <Beer className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-sm">{beerCount}</span>
            <span className="text-stone-300 font-normal">ሐበሻ ቢራ</span>
          </div>

          {/* Winning Streak */}
          {streak > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-sm">{streak}</span>
              <span className="text-[11px] font-normal">ተከታታይ</span>
            </div>
          )}

          {/* Progress */}
          <div className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 font-mono">
            {revealedCount}/10
          </div>
        </div>
      </div>

      {/* Visual Cold Beer Crate / Shelf */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-stone-300 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <Beer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-200">የቀዝቃዛ ሐበሻ ቢራ ሳጥን (Cold Habesha Beer Rack):</span>
          </span>
          <button
            onClick={onOpenGuide}
            className="text-amber-400 hover:text-amber-300 underline font-semibold"
          >
            የክፍሎች ዝርዝር መመሪያ (Guide)
          </button>
        </div>

        {/* 10 Beer Slots */}
        <div className="grid grid-cols-10 gap-1 sm:gap-1.5 p-2 rounded-2xl bg-stone-900/90 border border-amber-500/20 shadow-inner">
          {Array.from({ length: 10 }).map((_, idx) => {
            const hasBeer = idx < beerCount;
            return (
              <div
                key={idx}
                className={`relative aspect-square rounded-xl flex items-center justify-center transition-all ${
                  hasBeer
                    ? "bg-gradient-to-t from-amber-600 via-amber-500 to-amber-300 border-2 border-amber-200 shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-100"
                    : "bg-stone-950 border border-stone-800 text-stone-700"
                }`}
                title={hasBeer ? `ቀዝቃዛ ሐበሻ ቢራ #${idx + 1} ተሸልመዋል!` : `ሐበሻ ቢራ #${idx + 1}`}
              >
                {hasBeer ? (
                  <span className="text-base sm:text-xl drop-shadow select-none">
                    🍺
                  </span>
                ) : (
                  <span className="font-mono text-[10px] sm:text-xs text-stone-600">
                    {idx + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
