import React, { useState, useEffect } from "react";
import { OX_CUTS, OxCut, BUTCHER_RANKS } from "./oxCutsData";
import { OxDiagram } from "./components/OxDiagram";
import { QuestionModal } from "./components/QuestionModal";
import { BeerAwardModal } from "./components/BeerAwardModal";
import { GameOverModal } from "./components/GameOverModal";
import { VictoryModal } from "./components/VictoryModal";
import { BeerRack } from "./components/BeerRack";
import { ButcherGuideModal } from "./components/ButcherGuideModal";
import { WinnerRegistrationModal } from "./components/WinnerRegistrationModal";
import { ExitSummaryModal } from "./components/ExitSummaryModal";
import { OwnerSheetModal } from "./components/OwnerSheetModal";
import { initAuth, logout } from "./services/googleSheetsService";
import { User } from "firebase/auth";
import {
  playBeerClink,
  playBeerPour,
  playCorrectSound,
  playWrongSound,
  playGrandMasterFanfare,
  setSoundMuted,
  getSoundMuted,
} from "./utils/audio";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  Trophy,
  Flame,
  Beer,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  ChevronRight,
  Sheet,
  ExternalLink,
  LogOut,
} from "lucide-react";

export default function App() {
  // Game state
  const [revealedCutIds, setRevealedCutIds] = useState<number[]>([]);
  const [correctCutIds, setCorrectCutIds] = useState<number[]>([]);
  const [failedCutIds, setFailedCutIds] = useState<number[]>([]);
  const [activeCut, setActiveCut] = useState<OxCut | null>(null);
  const [questionCut, setQuestionCut] = useState<OxCut | null>(null);
  const [beerCount, setBeerCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem("ox_quiz_best_streak") || "0", 10);
  });

  // Modals & UI states
  const [awardingCut, setAwardingCut] = useState<OxCut | null>(null);
  const [registeringCut, setRegisteringCut] = useState<OxCut | null>(null);
  const [registeredCutTrophy, setRegisteredCutTrophy] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [failedCut, setFailedCut] = useState<OxCut | null>(null);
  const [lastUserAnswer, setLastUserAnswer] = useState<string>("");
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showAllLabels, setShowAllLabels] = useState<boolean>(false);
  const [showExitSummary, setShowExitSummary] = useState<boolean>(false);
  const [showOwnerSheetModal, setShowOwnerSheetModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  // Mobile/Tablet active tab: 'game' | 'beers' | 'guide'
  const [mobileTab, setMobileTab] = useState<"game" | "beers" | "guide">("game");

  // Compute the next unrevealed cut to glow on the ox diagram after at least 1 cut is answered
  const nextUnrevealedCut = OX_CUTS.find((c) => !revealedCutIds.includes(c.id)) || null;
  const recommendedCutId = revealedCutIds.length > 0 ? nextUnrevealedCut?.id ?? null : null;

  // Listen to Google Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => setCurrentUser(user),
      () => setCurrentUser(null)
    );
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Sound toggle handler
  const handleToggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    setSoundMuted(nextState);
  };

  // Start a question when a cut number badge is clicked
  const handleSelectCut = (cut: OxCut) => {
    setActiveCut(cut);
    // If cut has not been revealed yet, prompt question
    if (!revealedCutIds.includes(cut.id) && !showAllLabels) {
      setQuestionCut(cut);
    }
  };

  // Process user's answer
  const handleAnswer = (selectedName: string) => {
    if (!questionCut) return;

    const isCorrect = selectedName === questionCut.amharicName;
    const answeredCut = questionCut;
    setQuestionCut(null);

    if (isCorrect) {
      // 1. Correct answer: reveal Amharic name, award beer, play sounds!
      const nextBeers = beerCount + 1;
      const nextStreak = streak + 1;
      setBeerCount(nextBeers);
      setStreak(nextStreak);
      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
        localStorage.setItem("ox_quiz_best_streak", nextStreak.toString());
      }

      setRevealedCutIds((prev) => (prev.includes(answeredCut.id) ? prev : [...prev, answeredCut.id]));
      setCorrectCutIds((prev) => (prev.includes(answeredCut.id) ? prev : [...prev, answeredCut.id]));
      setActiveCut(answeredCut);

      // Play audio sequence: victory tone, then cold beer pour & clink!
      playCorrectSound();
      setTimeout(() => {
        playBeerPour();
        playBeerClink();
      }, 250);

      // Define trophy title won for this cut
      const trophyWon = `${answeredCut.amharicName} የወርቅ ዋንጫ + ቀዝቃዛው ሐበሻ ቢራ`;
      setRegisteredCutTrophy(trophyWon);

      // AUTOMATICALLY ASK NAME & PHONE NUMBER THEN STORE TO GOOGLE SHEET
      setRegisteringCut(answeredCut);
    } else {
      // 2. Wrong answer: reveal correct name, kindly tell player they lost
      setStreak(0);
      setRevealedCutIds((prev) => (prev.includes(answeredCut.id) ? prev : [...prev, answeredCut.id]));
      setFailedCutIds((prev) => (prev.includes(answeredCut.id) ? prev : [...prev, answeredCut.id]));
      setActiveCut(answeredCut);
      setLastUserAnswer(selectedName);
      setFailedCut(answeredCut);

      playWrongSound();
    }
  };

  // After name and phone number registration is completed
  const handleRegistrationDone = () => {
    const cutToAward = registeringCut;
    setRegisteringCut(null);
    if (!cutToAward) return;

    setActiveCut(cutToAward);

    // Check if all 10 cuts are completed
    if (beerCount >= 10) {
      setTimeout(() => {
        playGrandMasterFanfare();
        setIsVictory(true);
      }, 600);
    } else {
      setAwardingCut(cutToAward);
    }
  };

  // Return to home page after winning a beer, showing the answered info & glowing next number
  const handleNextCutAfterAward = () => {
    setAwardingCut(null);
    setQuestionCut(null);
    setMobileTab("game");
  };

  // Restart game
  const handleRestartGame = () => {
    setRevealedCutIds([]);
    setCorrectCutIds([]);
    setFailedCutIds([]);
    setActiveCut(null);
    setQuestionCut(null);
    setAwardingCut(null);
    setFailedCut(null);
    setIsVictory(false);
    setBeerCount(0);
    setStreak(0);
    setShowAllLabels(false);
  };

  // Continue reviewing map after losing
  const handleContinueReview = () => {
    setFailedCut(null);
  };

  return (
    <div className="min-h-screen habesha-luxury-bg text-stone-100 flex flex-col selection:bg-amber-400 selection:text-stone-950 font-sans">
      {/* Top Global Bar */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-amber-500/30 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        {/* Left: Habesha Gold Wordmark */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
          <img
            src="/assets/aistudio/Habesha_text_79f26b7d.png"
            alt="Habesha"
            className="h-6 sm:h-8 object-contain drop-shadow shrink-0"
          />
          <span className="hidden xs:inline-block w-px h-5 bg-amber-500/40 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-amber-200 tracking-wide truncate">
            የበሬ ሥጋ ክፍሎች
          </span>
        </div>

        {/* Right Actions: Sheet, Sound, Exit, Restart & Top-Right Habesha Medallion */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Central Owner Google Sheet Manager */}
          <button
            onClick={() => setShowOwnerSheetModal(true)}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:text-white hover:bg-emerald-900 transition flex items-center gap-1.5 text-xs font-bold"
            title="ማዕከላዊ Google Sheet"
          >
            <Sheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Google Sheet</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-900/90 border border-amber-500/30 hover:text-white text-stone-300 hover:bg-stone-800 transition shadow-inner"
            title={isMuted ? "ድምፅ ክፈት (Unmute)" : "ድምፅ አጥፋ (Mute)"}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Quick Restart */}
          <button
            onClick={handleRestartGame}
            className="p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl hover:from-amber-300 hover:to-yellow-400 transition whitespace-nowrap shrink-0 flex items-center gap-1 shadow-[0_0_12px_rgba(212,175,55,0.3)] active:scale-95"
            title="አዲስ ዙር ጀምር"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">አዲስ ዙር</span>
          </button>

          {/* Exit Game Button (Active when at least 1 question is answered) */}
          {revealedCutIds.length >= 1 && (
            <button
              onClick={() => setShowExitSummary(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-500/50 rounded-xl hover:bg-rose-900 hover:text-white transition whitespace-nowrap shrink-0 flex items-center gap-1 shadow-sm active:scale-95"
              title="ውጣ / ጨዋታውን አጠናቅቅ (Exit Game)"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>ውጣ</span>
            </button>
          )}

          {/* Creative Habesha Top-Right Luxury Emblem Medallion */}
          <div
            onClick={() => {
              playBeerClink();
            }}
            className="group relative cursor-pointer flex items-center gap-1.5 pl-1 pr-2 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-stone-900 via-stone-950 to-amber-950/80 border border-amber-500/50 shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:border-amber-400 hover:shadow-[0_0_20px_rgba(212,175,55,0.45)] transition-all duration-300"
            title="ቀዝቃዛው ሐበሻ ቢራ · የሚያረካ!"
          >
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/assets/aistudio/Top_Logo_36f2e7cb.png"
                alt="Habesha Beer Official Emblem"
                className="w-full h-full object-cover rounded-full"
              />
              <span className="absolute -inset-0.5 rounded-full border border-amber-300/40 animate-spin [animation-duration:12s] pointer-events-none" />
            </div>

            <div className="flex flex-col text-left leading-tight hidden xs:flex">
              <span className="text-[10px] font-black tracking-wider uppercase text-habesha-gold">
                ሐበሻ
              </span>
              <span className="text-[9px] text-stone-400 font-medium whitespace-nowrap">
                የሚያረካ 🍺
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Responsive Workspace */}
      {/* ================= MOBILE & TABLET LAYOUT (< 1024px) ================= */}
      <div className="lg:hidden flex-1 w-full max-w-2xl mx-auto flex flex-col justify-between pb-16">
        {/* Compact Top Stats Strip */}
        <div className="px-3.5 py-2 border-b border-amber-500/20 bg-black/50 flex items-center justify-between text-xs">
          <button
            onClick={() => setMobileTab("beers")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 font-bold hover:bg-amber-500/25 transition active:scale-95"
          >
            <span>🍺</span>
            <span>{beerCount} / 10 ሐበሻ ቢራ</span>
          </button>

              {/* Exit Button when at least 1 question answered + Streak */}
              <div className="flex items-center gap-2">
                {revealedCutIds.length >= 1 && (
                  <button
                    onClick={() => setShowExitSummary(true)}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950/70 border border-rose-500/50 text-rose-300 font-bold hover:bg-rose-900 transition active:scale-95 text-[11px] shadow"
                    title="ጨዋታውን አጠናቅቀህ ውጣ"
                  >
                    <LogOut className="w-3 h-3 text-rose-400" />
                    <span>ውጣ (Exit)</span>
                  </button>
                )}

                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{streak} ተከታታይ</span>
                </div>
              </div>
            </div>

            {/* Mobile Tab Content */}
            <div className="flex-1 flex flex-col p-2.5 sm:p-3 overflow-y-auto">
              {mobileTab === "game" && (
                /* TAB 1: OX GAME ARENA (Minimalist) */
                <div className="flex-1 flex flex-col justify-center gap-3">
                  {/* The Ox Diagram (No White Background - Pure Habesha Luxury Art) */}
                  <div className="w-full">
                    <OxDiagram
                      revealedCutIds={revealedCutIds}
                      correctCutIds={correctCutIds}
                      failedCutIds={failedCutIds}
                      activeCutId={activeCut?.id || null}
                      recommendedCutId={recommendedCutId}
                      onSelectCut={handleSelectCut}
                      showAllLabels={showAllLabels}
                    />
                  </div>

                  {/* Home Page Information & Next Glowing Cut Indicator */}
                  {activeCut ? (
                    <div className="p-3 rounded-2xl bg-stone-900/90 border border-amber-500/30 space-y-2.5 shadow-lg">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-amber-500/30 shrink-0">
                            #{activeCut.id}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {revealedCutIds.includes(activeCut.id)
                              ? activeCut.amharicName
                              : `ክፍል #${activeCut.id}`}
                          </span>
                        </div>

                        {correctCutIds.includes(activeCut.id) ? (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                            ተሸልመዋል 🍺
                          </span>
                        ) : !revealedCutIds.includes(activeCut.id) ? (
                          <button
                            onClick={() => setQuestionCut(activeCut)}
                            className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 font-black text-xs transition active:scale-95"
                          >
                            ገምት
                          </button>
                        ) : null}
                      </div>

                      {revealedCutIds.includes(activeCut.id) && (
                        <div className="space-y-1.5 text-left border-t border-stone-800/80 pt-2">
                          <p className="text-xs text-amber-300 font-semibold">
                            🍽️ {activeCut.traditionalDish}
                          </p>
                          <p className="text-[11px] text-stone-300 leading-relaxed">
                            {activeCut.description}
                          </p>
                        </div>
                      )}

                      {revealedCutIds.includes(activeCut.id) && nextUnrevealedCut && (
                        <button
                          onClick={() => handleSelectCut(nextUnrevealedCut)}
                          className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center justify-between transition active:scale-98 shadow-[0_0_15px_rgba(251,191,36,0.18)]"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span>ቀጣይ የሚያበራውን ቁጥር #{nextUnrevealedCut.id} ይክፈቱ</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-stone-950 font-mono font-black">
                            #{nextUnrevealedCut.id} 👆
                          </span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="px-3 py-2.5 rounded-2xl bg-stone-900/60 border border-stone-800/80 text-center text-xs text-stone-400 flex items-center justify-between">
                      <span>በምስሉ ላይ ቁጥር 1-10 ይንኩ</span>
                      <button
                        onClick={() => {
                          if (nextUnrevealedCut) handleSelectCut(nextUnrevealedCut);
                        }}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 transition text-xs"
                      >
                        ጀምር 👆
                      </button>
                    </div>
                  )}
                </div>
              )}

              {mobileTab === "beers" && (
                /* TAB 2: HABESHA BEER RACK */
                <div className="flex-1 flex flex-col justify-start gap-3 py-1">
                  <BeerRack
                    beerCount={beerCount}
                    streak={streak}
                    revealedCount={revealedCutIds.length}
                    onOpenGuide={() => setShowGuide(true)}
                  />
                  <button
                    onClick={() => setMobileTab("game")}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 font-bold text-xs shadow active:scale-95 transition"
                  >
                    ወደ ጨዋታው ተመለስ (Back to Game)
                  </button>
                </div>
              )}

              {mobileTab === "guide" && (
                /* TAB 3: BUTCHER GUIDE FOR ALL 10 CUTS */
                <div className="flex-1 flex flex-col gap-2 py-1 text-left">
                  <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/20">
                    <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>የ10ሩ የበሬ ሥጋ ክፍሎች</span>
                    </h3>
                    <span className="text-[10px] text-stone-400 font-mono">
                      10 ክፍሎች
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto pr-1 max-h-[460px]">
                    {OX_CUTS.map((cut) => {
                      const isFound = correctCutIds.includes(cut.id);
                      return (
                        <div
                          key={cut.id}
                          onClick={() => {
                            setActiveCut(cut);
                            setMobileTab("game");
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition active:scale-98 ${
                            isFound
                              ? "bg-emerald-950/40 border-emerald-800/50 text-stone-200"
                              : "bg-stone-900/90 border-stone-800 text-stone-300 hover:border-amber-500/40"
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-amber-300">
                              {cut.id}. {cut.amharicName}
                            </span>
                            {isFound ? (
                              <span className="text-[10px] text-emerald-400">ተገምቷል 🍺</span>
                            ) : (
                              <span className="text-[10px] text-amber-500">ገምት</span>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">
                            {cut.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

        {/* Mobile/Tablet Bottom Navigation Bar */}
        <nav className="fixed bottom-0 inset-x-0 border-t border-amber-500/30 bg-black/95 backdrop-blur-md px-3 py-2 flex items-center justify-around z-30">
          <button
            onClick={() => setMobileTab("game")}
            className={`flex flex-col items-center gap-0.5 transition active:scale-90 ${
              mobileTab === "game" ? "text-amber-400 font-bold" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <span className="text-base">🐂</span>
            <span className="text-[10px]">ጨዋታ</span>
          </button>

          <button
            onClick={() => setMobileTab("beers")}
            className={`relative flex flex-col items-center gap-0.5 transition active:scale-90 ${
              mobileTab === "beers" ? "text-amber-400 font-bold" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <span className="text-base">🍺</span>
            <span className="text-[10px]">ሐበሻ ሳጥን</span>
            {beerCount > 0 && (
              <span className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-stone-950 text-[9px] font-black flex items-center justify-center shadow">
                {beerCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileTab("guide")}
            className={`flex flex-col items-center gap-0.5 transition active:scale-90 ${
              mobileTab === "guide" ? "text-amber-400 font-bold" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[10px]">መመሪያ</span>
          </button>

          <button
            onClick={handleRestartGame}
            className="flex flex-col items-center gap-0.5 text-stone-400 hover:text-amber-300 transition active:scale-90"
            title="አዲስ ዙር"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[10px]">እንደገና</span>
          </button>
        </nav>
      </div>

      {/* ================= DESKTOP LAYOUT (>= 1024px) ================= */}
      <main className="hidden lg:flex flex-1 max-w-6xl w-full mx-auto p-6 flex-col justify-center gap-5">
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-7 flex flex-col gap-4">
            <OxDiagram
              revealedCutIds={revealedCutIds}
              correctCutIds={correctCutIds}
              failedCutIds={failedCutIds}
              activeCutId={activeCut?.id || null}
              recommendedCutId={recommendedCutId}
              onSelectCut={handleSelectCut}
              showAllLabels={showAllLabels}
            />
          </div>

          <div className="col-span-5 flex flex-col gap-4">
            <BeerRack
              beerCount={beerCount}
              streak={streak}
              revealedCount={revealedCutIds.length}
              onOpenGuide={() => setShowGuide(true)}
            />

            {/* Desktop Home Page Cut Info & Next Glowing Indicator */}
            {activeCut && revealedCutIds.includes(activeCut.id) && (
              <div className="p-4 rounded-3xl bg-stone-950/95 border border-amber-500/35 space-y-2.5 shadow-xl text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-bold text-sm flex items-center justify-center border border-amber-500/30">
                      #{activeCut.id}
                    </span>
                    <h3 className="text-lg font-black text-amber-300">
                      {activeCut.amharicName}
                    </h3>
                  </div>
                  {correctCutIds.includes(activeCut.id) && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                      ተሸልመዋል 🍺
                    </span>
                  )}
                </div>

                <p className="text-xs text-amber-200 font-semibold">
                  🍽️ {activeCut.traditionalDish}
                </p>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {activeCut.description}
                </p>

                {nextUnrevealedCut && (
                  <button
                    onClick={() => handleSelectCut(nextUnrevealedCut)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center justify-between transition active:scale-98 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                      <span>ቀጣይ የሚያበራውን ቁጥር #{nextUnrevealedCut.id} ይክፈቱ</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-stone-950 font-mono font-black">
                      #{nextUnrevealedCut.id} 👆
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals & Dialogs */}
      {/* 1. Question Modal with choices */}
      {questionCut && (
        <QuestionModal
          cut={questionCut}
          onAnswer={handleAnswer}
          onClose={() => setQuestionCut(null)}
        />
      )}

      {/* 1.5. Winner Registration Modal (Prompts Name, Phone Number & Gender, records trophy to Google Sheets) */}
      {registeringCut && (
        <WinnerRegistrationModal
          cut={registeringCut}
          beerCount={beerCount}
          rankTitle={
            ([...BUTCHER_RANKS].reverse().find((r) => beerCount >= r.minBeers) || BUTCHER_RANKS[0]).titleAm
          }
          trophyTitle={registeredCutTrophy}
          currentUser={currentUser}
          onRegistered={handleRegistrationDone}
        />
      )}

      {/* 2. Beer Award Celebration Modal */}
      {awardingCut && (
        <BeerAwardModal
          cut={awardingCut}
          beerCount={beerCount}
          onNext={handleNextCutAfterAward}
          onExit={() => {
            setAwardingCut(null);
            setShowExitSummary(true);
          }}
          isGameComplete={beerCount >= 10}
        />
      )}

      {/* 2.5. Exit & Session Summary Modal */}
      {showExitSummary && (
        <ExitSummaryModal
          beerCount={beerCount}
          correctCutIds={correctCutIds}
          onRestart={() => {
            setShowExitSummary(false);
            handleRestartGame();
          }}
          onResume={() => setShowExitSummary(false)}
        />
      )}

      {/* 3. Game Over Modal with kind hospitality message & correct answer */}
      {failedCut && (
        <GameOverModal
          cut={failedCut}
          userAnswer={lastUserAnswer}
          beerCount={beerCount}
          onRestart={handleRestartGame}
          onContinueReview={handleContinueReview}
        />
      )}

      {/* 4. Grand Master Victory Modal */}
      {isVictory && (
        <VictoryModal
          beerCount={beerCount}
          onRestart={handleRestartGame}
        />
      )}

      {/* 5. Complete Cuts Guide Modal */}
      {showGuide && (
        <ButcherGuideModal
          onClose={() => setShowGuide(false)}
          onSelectCutToPractice={(cut) => {
            setActiveCut(cut);
          }}
        />
      )}

      {/* 6. Central Owner Google Sheet Modal */}
      {showOwnerSheetModal && (
        <OwnerSheetModal
          currentUser={currentUser}
          onClose={() => setShowOwnerSheetModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-stone-900 py-2.5 pb-16 lg:pb-2.5 px-4 text-center text-xs text-stone-500">
        <p>ሐበሻ ቢራ · የበሬ ሥጋ ክፍሎች © 2026</p>
      </footer>
    </div>
  );
}
