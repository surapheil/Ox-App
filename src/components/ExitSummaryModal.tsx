import React from "react";
import { OX_CUTS, BUTCHER_RANKS } from "../oxCutsData";
import { Trophy, Sheet, RotateCcw, ArrowLeft, CheckCircle2, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExitSummaryModalProps {
  beerCount: number;
  correctCutIds: number[];
  onRestart: () => void;
  onResume: () => void;
}

export const ExitSummaryModal: React.FC<ExitSummaryModalProps> = ({
  beerCount,
  correctCutIds,
  onRestart,
  onResume,
}) => {
  const winnerName = localStorage.getItem("habesha_winner_name") || "ተወዳዳሪ";
  const winnerPhone = localStorage.getItem("habesha_winner_phone") || "";
  const winnerGender = localStorage.getItem("habesha_winner_gender") || "";
  const sheetId = localStorage.getItem("habesha_quiz_google_sheet_id");

  // Determine achieved rank
  const rank =
    [...BUTCHER_RANKS].reverse().find((r) => beerCount >= r.minBeers) ||
    BUTCHER_RANKS[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-stone-950 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-7 text-center shadow-[0_20px_60px_rgba(212,175,55,0.25)] overflow-hidden my-4"
        >
          {/* Subtle gold ambient glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Habesha brand header */}
          <div className="flex justify-center mb-3">
            <img
              src="/assets/aistudio/Habesha_text_79f26b7d.png"
              alt="Habesha Beer"
              className="h-8 object-contain drop-shadow"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>የውድድር ማጠቃለያ (Session Summary)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            በድል ወጥተዋል! 🍻
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-1">
            ውድድሩን በዚህ አጠናቀዋል። ያሸነፉት ሽልማትና መረጃ በሙሉ ተመዝግቧል!
          </p>

          {/* Player profile card */}
          <div className="mt-4 p-4 rounded-2xl bg-stone-900/90 border border-amber-500/30 text-left space-y-2.5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div>
                <span className="text-[11px] text-stone-400 block">የተወዳዳሪ ስም</span>
                <span className="text-base font-bold text-amber-300">
                  {winnerName} {winnerGender && `(${winnerGender})`}
                </span>
              </div>
              {winnerPhone && (
                <div className="text-right">
                  <span className="text-[11px] text-stone-400 block">ስልክ ቁጥር</span>
                  <span className="text-xs font-mono text-stone-300">
                    {winnerPhone}
                  </span>
                </div>
              )}
            </div>

            {/* Beer & Rank Achievements */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800">
                <span className="text-[11px] text-stone-400 block">የተሸለሙት ሐበሻ ቢራ</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {beerCount} 🍺
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800">
                <span className="text-[11px] text-stone-400 block">የተሰጠዎት ማዕረግ</span>
                <span className="text-sm font-bold text-emerald-300">
                  {rank.titleAm}
                </span>
              </div>
            </div>

            {/* List of correctly identified cuts */}
            {correctCutIds.length > 0 && (
              <div className="pt-2 border-t border-stone-800">
                <span className="text-[11px] text-stone-400 block mb-1.5 font-medium">
                  በትክክል የተገመቱ የበሬ ሥጋ ክፍሎች ({correctCutIds.length}/10):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {correctCutIds.map((id) => {
                    const cut = OX_CUTS.find((c) => c.id === id);
                    if (!cut) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 text-[11px] font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>#{cut.id} {cut.amharicName}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Google Sheet Sync Confirmation */}
          <div className="mt-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-left flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-900/60 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Sheet className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-300">
                  በGoogle Sheet ተመዝግቧል
                </p>
                <p className="text-[10px] text-stone-400">
                  ስም፣ ስልክ፣ ጾታ እና ያሸነፉት ዋንጫ ተቀምጧል
                </p>
              </div>
            </div>

            {sheetId && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 text-xs font-bold transition flex items-center gap-1 shrink-0"
              >
                <span>ክፈት</span>
                <Trophy className="w-3 h-3 text-emerald-400" />
              </a>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={onRestart}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>አዲስ ዙር ጀምር (Play Again)</span>
            </button>

            <button
              onClick={onResume}
              className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs sm:text-sm font-semibold active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ወደ ጨዋታው ተመለስ (Resume)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
