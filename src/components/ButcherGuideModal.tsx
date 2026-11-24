import React, { useState } from "react";
import { OX_CUTS, OxCut } from "../oxCutsData";
import { X, UtensilsCrossed, Sparkles, BookOpen, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ButcherGuideModalProps {
  onClose: () => void;
  onSelectCutToPractice: (cut: OxCut) => void;
}

export const ButcherGuideModal: React.FC<ButcherGuideModalProps> = ({
  onClose,
  onSelectCutToPractice,
}) => {
  const [search, setSearch] = useState("");

  const filteredCuts = OX_CUTS.filter(
    (c) =>
      c.amharicName.includes(search) ||
      c.phoneticEn.toLowerCase().includes(search.toLowerCase()) ||
      c.englishMeaning.toLowerCase().includes(search.toLowerCase()) ||
      c.traditionalDish.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-stone-950 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-yellow-600 shadow shrink-0">
                <img
                  src="/assets/aistudio/Top_Logo_36f2e7cb.png"
                  alt="Habesha Emblem"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  የበሬ ሥጋ ክፍሎች መመሪያ · ሐበሻ ቢራ
                </h3>
                <p className="text-xs text-amber-200/80 font-medium">
                  የባህላዊ የኢትዮጵያ የበሬ ሥጋ ክፍሎች፣ ስሞች እና አዘገጃጀቶች
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-900 transition"
              aria-label="ዝጋ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mt-3 mb-2">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="በስም ወይም በምግብ ፈልግ (Search cuts or dishes)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 placeholder:text-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Cuts Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mt-2">
            {filteredCuts.map((cut) => (
              <div
                key={cut.id}
                className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800/80 hover:border-amber-500/40 transition-all text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-amber-500/30">
                      #{cut.id}
                    </span>
                    <h4 className="text-base font-bold text-amber-300">
                      {cut.amharicName}
                    </h4>
                    <span className="text-xs font-mono text-stone-400">
                      ({cut.phoneticEn})
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectCutToPractice(cut);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 text-xs font-medium transition"
                  >
                    በካርታው ሞክር
                  </button>
                </div>

                <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                  {cut.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-stone-900 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-amber-400 flex items-center gap-1 font-medium">
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>ምርጥ ለ: {cut.traditionalDish}</span>
                  </span>
                  <span className="text-stone-400 italic text-[11px]">
                    ቦታ፡ {cut.hint}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-stone-800 flex justify-end">
            <button
              onClick={onClose}
              className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm"
            >
              ወደ ጨዋታው ተመለስ (Back to Game)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
