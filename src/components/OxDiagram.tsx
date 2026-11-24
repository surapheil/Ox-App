import React, { useState } from "react";
import { OX_CUTS, OxCut } from "../oxCutsData";
import { Check, HelpCircle, Sparkles, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface OxDiagramProps {
  revealedCutIds: number[];
  correctCutIds: number[];
  failedCutIds: number[];
  activeCutId: number | null;
  recommendedCutId?: number | null;
  onSelectCut: (cut: OxCut) => void;
  showAllLabels?: boolean;
}

export const OxDiagram: React.FC<OxDiagramProps> = ({
  revealedCutIds,
  correctCutIds,
  failedCutIds,
  activeCutId,
  recommendedCutId = null,
  onSelectCut,
  showAllLabels = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredCutId, setHoveredCutId] = useState<number | null>(null);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.3, 2.2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.3, 1));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="relative w-full max-w-lg lg:max-w-xl mx-auto bg-stone-950/95 rounded-2xl sm:rounded-3xl p-2 sm:p-3 border border-amber-500/35 shadow-[0_20px_50px_rgba(0,0,0,0.95)] overflow-hidden">
      {/* Minimal Header with Zoom */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1 text-xs">
        <span className="text-amber-300 font-bold tracking-wide text-xs">
          የበሬ ሥጋ ክፍሎች
        </span>

        <div className="flex items-center gap-1 bg-stone-900/90 rounded-lg p-0.5 border border-amber-500/25">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-stone-300 hover:text-amber-300 rounded-md hover:bg-stone-800 transition active:scale-90"
            title="አጉላ"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="p-1.5 text-stone-300 hover:text-amber-300 disabled:opacity-30 rounded-md hover:bg-stone-800 transition active:scale-90"
            title="አሳንስ"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          {zoomLevel > 1 && (
            <button
              onClick={handleResetZoom}
              className="p-1.5 hover:text-white rounded-md hover:bg-stone-800 transition text-amber-400 active:scale-90"
              title="ወደ ነበረበት መልስ"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Diagram Viewport: 100% Habesha Luxury Dark & Gold Backdrop (No White Background) */}
      <div
        className={`relative w-full aspect-square rounded-xl sm:rounded-2xl bg-[#0A0A0C] touch-pan-x touch-pan-y shadow-2xl select-none border border-amber-500/30 ${
          zoomLevel > 1 ? "overflow-hidden" : "overflow-visible"
        }`}
      >
        <div
          className="relative w-full h-full transition-transform duration-200 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Base Ox Image with Habesha Luxury Gold & Black Background and Logos */}
          <img
            src="/assets/aistudio/habesha_ox_clean_luxury.png"
            alt="Habesha Beer Ethiopian Ox Cuts Luxury Diagram"
            className="w-full h-full object-contain rounded-xl sm:rounded-2xl pointer-events-none select-none"
            referrerPolicy="no-referrer"
            draggable={false}
          />

          {/* Interactive Number Pins overlaying the 10 cuts */}
          {OX_CUTS.map((cut) => {
            const isRevealed = showAllLabels || revealedCutIds.includes(cut.id);
            const isCorrect = correctCutIds.includes(cut.id);
            const isFailed = failedCutIds.includes(cut.id);
            const isActive = activeCutId === cut.id;
            const isRecommended = !isRevealed && recommendedCutId === cut.id;
            const isHovered = hoveredCutId === cut.id;

            return (
              <React.Fragment key={cut.id}>
                {/* 1. Interactive Label Badge at the end of pointer line */}
                <div
                  className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                    isRecommended ? "z-30" : "z-20"
                  }`}
                  style={{
                    left: `${cut.labelPosition.x}%`,
                    top: `${cut.labelPosition.y}%`,
                  }}
                  onMouseEnter={() => setHoveredCutId(cut.id)}
                  onMouseLeave={() => setHoveredCutId(null)}
                >
                  {isRevealed ? (
                    /* REVEALED STATE: Displays Correct Amharic Cut Name in Luxury Habesha Gold */
                    <button
                      onClick={() => onSelectCut(cut)}
                      className={`group flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full font-bold text-[11px] sm:text-xs shadow-xl transition-all duration-200 border ${
                        isCorrect
                          ? "bg-gradient-to-r from-stone-950 via-amber-950/90 to-stone-950 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.5)] ring-1 ring-amber-400/50"
                          : isFailed
                          ? "bg-stone-950 text-amber-200/90 border-amber-700/80 shadow-md"
                          : "bg-stone-950 text-amber-300 border-amber-500/60"
                      } ${isActive ? "ring-2 ring-amber-400 scale-105" : "hover:scale-105 active:scale-95"}`}
                      title={`${cut.id}. ${cut.amharicName}`}
                    >
                      <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-stone-950 text-[10px] sm:text-xs flex items-center justify-center font-mono font-black shrink-0 shadow">
                        {cut.id}
                      </span>
                      <span className="font-bold tracking-wide whitespace-nowrap text-amber-100 group-hover:text-amber-300">
                        {cut.amharicName}
                      </span>
                      {isCorrect && (
                        <span className="text-amber-300 text-xs drop-shadow" title="ቀዝቃዛ ሐበሻ ቢራ">
                          🍺
                        </span>
                      )}
                    </button>
                  ) : (
                    /* UNREVEALED / NUMBER STATE: Glowing Next Beacon or Calm Gold Medallion */
                    <button
                      onClick={() => onSelectCut(cut)}
                      className={`relative group flex items-center justify-center rounded-full font-bold shadow-2xl transition-all duration-300 active:scale-90 ${
                        isRecommended
                          ? "w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-yellow-200 via-amber-400 to-yellow-500 text-stone-950 border-2 border-white ring-4 ring-amber-400/70 scale-115 shadow-[0_0_28px_rgba(251,191,36,0.95)]"
                          : isActive
                          ? "w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-600 text-stone-950 ring-4 ring-amber-400/60 scale-110 shadow-[0_0_20px_#D4AF37]"
                          : isHovered
                          ? "w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-amber-400 to-yellow-500 text-stone-950 ring-2 ring-amber-300 scale-105 shadow-[0_0_16px_rgba(212,175,55,0.6)]"
                          : "w-7 h-7 sm:w-8 sm:h-8 bg-stone-900/95 text-amber-400 border-2 border-amber-500/60 shadow-[0_0_10px_rgba(212,175,55,0.2)] hover:border-amber-300 hover:text-white"
                      }`}
                      title={`ክፍል #${cut.id} ለመገመት ይጫኑ`}
                      aria-label={`Guess cut number ${cut.id}`}
                    >
                      <span className="font-mono text-xs sm:text-sm font-black tracking-tight relative z-10">
                        {cut.id}
                      </span>

                      {/* Strong glowing beacon rings on the recommended next number */}
                      {isRecommended ? (
                        <>
                          <span className="absolute -inset-2 rounded-full bg-amber-400/50 animate-ping pointer-events-none" />
                          <span className="absolute -inset-3 rounded-full bg-yellow-400/25 blur-sm animate-pulse pointer-events-none" />
                        </>
                      ) : !recommendedCutId && !isActive ? (
                        <span className="absolute -inset-1 rounded-full bg-amber-400/25 animate-ping opacity-60 pointer-events-none" />
                      ) : null}
                    </button>
                  )}
                </div>

                {/* 2. Target Pulse Dot on the actual ox body */}
                <button
                  onClick={() => onSelectCut(cut)}
                  onMouseEnter={() => setHoveredCutId(cut.id)}
                  onMouseLeave={() => setHoveredCutId(null)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 group transition-all duration-300 active:scale-90 ${
                    isRecommended
                      ? "z-20 scale-125"
                      : isActive || isHovered
                      ? "z-10 scale-125"
                      : "z-10 hover:scale-110"
                  }`}
                  style={{
                    left: `${cut.targetPoint.x}%`,
                    top: `${cut.targetPoint.y}%`,
                  }}
                  title={`ክፍል #${cut.id}`}
                  aria-label={`Cut #${cut.id} target`}
                >
                  {/* Extra radiant part spotlight when recommended */}
                  {isRecommended && (
                    <span className="absolute inset-0 m-auto w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400/45 animate-ping pointer-events-none" />
                  )}

                  <span
                    className={`relative block rounded-full border-2 transition-all ${
                      isRecommended
                        ? "w-4 h-4 sm:w-5 sm:h-5 bg-yellow-300 border-white shadow-[0_0_22px_#FBBF24] ring-4 ring-amber-400/70 animate-pulse"
                        : isActive
                        ? "w-3.5 h-3.5 sm:w-4 sm:h-4 bg-amber-400 border-white shadow-[0_0_12px_#D4AF37] ring-4 ring-amber-400/50"
                        : isCorrect
                        ? "w-3.5 h-3.5 sm:w-4 sm:h-4 bg-amber-400/90 border-amber-200 shadow-[0_0_8px_rgba(212,175,55,0.5)]"
                        : isFailed
                        ? "w-3.5 h-3.5 sm:w-4 sm:h-4 bg-stone-700 border-amber-600/70"
                        : "w-3.5 h-3.5 sm:w-4 sm:h-4 bg-amber-500/40 border-amber-400/60 group-hover:bg-amber-400"
                    }`}
                  />
                  {(isActive || isHovered || isRecommended) && (
                    <span
                      className={`absolute left-1/2 -top-5 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow border ${
                        isRecommended
                          ? "bg-amber-400 text-stone-950 border-yellow-200 shadow-[0_0_10px_#FBBF24]"
                          : "bg-stone-950/95 text-amber-300 border-amber-500/40"
                      }`}
                    >
                      #{cut.id}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
