import React, { useState, useEffect } from "react";
import { OxCut } from "../oxCutsData";
import {
  googleSignIn,
  appendWinnerToGoogleSheet,
  recordWinnerToServer,
  getCachedAccessToken,
} from "../services/googleSheetsService";
import { User } from "firebase/auth";
import { CheckCircle, ExternalLink, Sparkles, Phone, User as UserIcon, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WinnerRegistrationModalProps {
  cut: OxCut;
  beerCount: number;
  rankTitle: string;
  trophyTitle: string;
  currentUser: User | null;
  onRegistered: () => void;
}

export const WinnerRegistrationModal: React.FC<WinnerRegistrationModalProps> = ({
  cut,
  beerCount,
  rankTitle,
  trophyTitle,
  currentUser,
  onRegistered,
}) => {
  // Pre-fill from localStorage if previously registered
  const [name, setName] = useState<string>(() => localStorage.getItem("habesha_winner_name") || "");
  const [phone, setPhone] = useState<string>(() => localStorage.getItem("habesha_winner_phone") || "");
  const [gender, setGender] = useState<string>(
    () => localStorage.getItem("habesha_winner_gender") || "ወንድ"
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [savedSheetId, setSavedSheetId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If user signs in and name is empty, prefill from Google profile
  useEffect(() => {
    if (currentUser?.displayName && !name) {
      setName(currentUser.displayName);
    }
  }, [currentUser, name]);

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result?.user.displayName && !name) {
        setName(result.user.displayName);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Google መግባት አልተሳካም። እባክዎ እንደገና ይሞክሩ።");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !gender.trim()) {
      setErrorMsg("እባክዎ ሙሉ ስም፣ ስልክ ቁጥር እና ጾታ ይምረጡ።");
      return;
    }

    // Save to localStorage for quick re-use
    localStorage.setItem("habesha_winner_name", name.trim());
    localStorage.setItem("habesha_winner_phone", phone.trim());
    localStorage.setItem("habesha_winner_gender", gender.trim());

    setIsSubmitting(true);
    setErrorMsg(null);

    const winnerData = {
      name: name.trim(),
      phoneNumber: phone.trim(),
      gender: gender === "ወንድ" ? "ወንድ (Male)" : "ሴት (Female)",
      cutName: cut.amharicName,
      cutId: cut.id,
      trophyWon: trophyTitle,
      totalBeers: beerCount,
      rankTitle: rankTitle,
    };

    try {
      // 1. Permanently record to server and owner Google Sheet webhook
      await recordWinnerToServer(winnerData);

      // 2. If Google access token exists, also append directly
      const token = getCachedAccessToken();
      if (token) {
        try {
          const res = await appendWinnerToGoogleSheet(token, winnerData);
          setSavedSheetId(res.spreadsheetId);
        } catch (sheetErr) {
          console.warn("Direct Sheet append error:", sheetErr);
        }
      }

      // Small delay to let user see confirmation
      setTimeout(() => {
        onRegistered();
      }, 1200);
    } catch (err: any) {
      console.error("Failed to record winner:", err);
      // Still proceed gracefully
      setTimeout(() => {
        onRegistered();
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAccessToken = !!getCachedAccessToken();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="relative w-full sm:max-w-lg bg-[#08080B] border-t sm:border-2 border-amber-500/50 rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_20px_60px_rgba(212,175,55,0.25)] flex flex-col gap-3.5 text-left overflow-hidden max-h-[92vh] overflow-y-auto"
        >
          {/* Mobile Handle */}
          <div className="w-12 h-1 bg-amber-500/40 rounded-full mx-auto sm:hidden" />

          {/* Top Brand Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-amber-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow shrink-0">
                <img
                  src="/assets/aistudio/Top_Logo_36f2e7cb.png"
                  alt="Habesha"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">
                  ሐበሻ ቢራ · የግዴታ አሸናፊዎች ምዝገባ
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  እንኳን ደስ አለዎት! 🎉
                </h3>
              </div>
            </div>

            <span className="text-2xl">🍺</span>
          </div>

          {/* Trophy & Cut Won Card */}
          <div className="p-3 rounded-2xl bg-stone-900/90 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-amber-300 text-sm sm:text-base">
                {cut.id}. {cut.amharicName}
              </span>
              <p className="text-xs text-amber-200/80 font-medium">
                🏆 {trophyTitle}
              </p>
            </div>
            <span className="text-base font-mono font-black text-amber-400">
              {beerCount} 🍺
            </span>
          </div>

          {/* Form: Name, Phone & Gender (No Skip Option) */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>ሙሉ ስም *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ለምሳሌ፡ ዮናስ በቀለ"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 focus:border-amber-400 text-stone-100 placeholder-stone-500 text-sm focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>ስልክ ቁጥር *</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="ለምሳሌ፡ 0911 234 567"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 focus:border-amber-400 text-stone-100 placeholder-stone-500 text-sm focus:outline-none transition"
              />
            </div>

            {/* Gender Selection (Mandatory) */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                <span>ጾታ *</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender("ወንድ")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border active:scale-95 ${
                    gender === "ወንድ"
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-stone-900/90 border-stone-800 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <span>👨 ወንድ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender("ሴት")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border active:scale-95 ${
                    gender === "ሴት"
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-stone-900/90 border-stone-800 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <span>👩 ሴት</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
            )}

            {savedSheetId && (
              <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-200 flex items-center justify-between">
                <span>✅ መረጃዎ ተመዝግቧል!</span>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${savedSheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-amber-300 underline flex items-center gap-1"
                >
                  <span>ይመልከቱ</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Mandatory Submit Button (NO SKIP OPTION) */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-stone-950 font-black text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:from-amber-300 hover:to-yellow-400 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>በመመዝገብ ላይ...</span>
                  </>
                ) : (
                  <>
                    <span>መዝግብ እና ሽልማቱን ተቀበል</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
