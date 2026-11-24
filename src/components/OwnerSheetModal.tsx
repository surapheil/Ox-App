import React, { useState, useEffect } from "react";
import {
  fetchServerWinners,
  updateServerConfig,
  getServerConfig,
  googleSignIn,
  syncAllWinnersToGoogleSheet,
  getCachedAccessToken,
  getOrCreateSpreadsheet,
  WinnerEntry,
} from "../services/googleSheetsService";
import { User } from "firebase/auth";
import {
  Sheet,
  ExternalLink,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Save,
  Users,
  ShieldCheck,
  X,
  Link as LinkIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OwnerSheetModalProps {
  currentUser: User | null;
  onClose: () => void;
}

export const OwnerSheetModal: React.FC<OwnerSheetModalProps> = ({
  currentUser,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"sheet" | "webhook" | "winners">("sheet");
  const [winners, setWinners] = useState<WinnerEntry[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [ownerEmail, setOwnerEmail] = useState<string>("surafellamesgin@gmail.com");
  const [sheetWebhookUrl, setSheetWebhookUrl] = useState<string>("");
  const [spreadsheetId, setSpreadsheetId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(
    null
  );
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const serverData = await fetchServerWinners();
      setWinners(serverData.winners || []);
      setTotalCount(serverData.count || 0);

      const cfg = await getServerConfig();
      if (cfg) {
        if (cfg.sheetWebhookUrl) setSheetWebhookUrl(cfg.sheetWebhookUrl);
        if (cfg.spreadsheetId) setSpreadsheetId(cfg.spreadsheetId);
        if (cfg.ownerEmail) setOwnerEmail(cfg.ownerEmail);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      await updateServerConfig({
        sheetWebhookUrl: sheetWebhookUrl.trim(),
        spreadsheetId: spreadsheetId.trim(),
        ownerEmail: ownerEmail.trim(),
      });
      setStatusMsg({ text: "ቅንብሩ በተሳካ ሁኔታ ተቀምጧል!", type: "success" });
    } catch {
      setStatusMsg({ text: "ቅንብሩን ማስቀመጥ አልተቻለም።", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        const id = await getOrCreateSpreadsheet(res.accessToken);
        setSpreadsheetId(id);
        await updateServerConfig({ spreadsheetId: id });
        setStatusMsg({
          text: `በ ${res.user.email} Google Sheet በተሳካ ሁኔታ ተገናኝቷል!`,
          type: "success",
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ text: "Google መግባት አልተሳካም። እባክዎ እንደገና ይሞክሩ።", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAllToGoogle = async () => {
    const token = getCachedAccessToken();
    if (!token) {
      setStatusMsg({
        text: "እባክዎ መጀመሪያ በ Google ይግቡ (Sign in with Google as Owner)",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);
    try {
      const res = await syncAllWinnersToGoogleSheet(token, winners, spreadsheetId || undefined);
      setSpreadsheetId(res.spreadsheetId);
      setStatusMsg({
        text: `${res.count} የተመዘገቡ አሸናፊዎች ወደ Google Sheet ተላልፈዋል!`,
        type: "success",
      });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ text: "ወደ Google Sheet ማስተላለፍ አልተሳካም።", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const appsScriptCode = `// Google Apps Script for surafellamesgin@gmail.com
// 1. Open your Google Sheet
// 2. Click Extensions > Apps Script
// 3. Paste this code and click Deploy > New Deployment > Web App
// 4. Set "Execute as: Me" and "Who has access: Anyone"
// 5. Copy the Web App URL and paste it in the app!

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "ቀንና ሰዓት (Timestamp)",
        "የተጫዋች ስም (Player Name)",
        "ስልክ ቁጥር (Phone Number)",
        "ጾታ (Gender)",
        "የሥጋ ክፍል (Ox Cut)",
        "ክፍል ቁጥር (Cut #)",
        "የተሸለመው ዋንጫ (Trophy)",
        "ድምር ቢራ (Total Beers)",
        "ማዕረግ (Rank)"
      ]);
    }
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString(),
      data.name || "",
      data.phoneNumber || "",
      data.gender || "",
      data.cutName || "",
      "#" + (data.cutId || ""),
      data.trophyWon || "",
      data.totalBeers || 1,
      data.rankTitle || ""
    ]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyAppsScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#08080B] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-7 shadow-[0_25px_65px_rgba(212,175,55,0.25)] flex flex-col gap-4 text-left overflow-hidden my-4 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Sheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    የማዕከላዊ Google Sheet አስተዳዳሪ
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                    Owner: {ownerEmail}
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  የተጫዋቾች ስም፣ ስልክ ቁጥር እና ጾታ በአንድ ማዕከላዊ ሰንጠረዥ የሚሰበሰብበት
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-950 rounded-2xl border border-stone-800 text-xs">
            <button
              onClick={() => setActiveTab("sheet")}
              className={`flex-1 py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "sheet"
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 shadow"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Sheet className="w-3.5 h-3.5" />
              <span>Google Sheet ማገናኛ</span>
            </button>

            <button
              onClick={() => setActiveTab("webhook")}
              className={`flex-1 py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "webhook"
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 shadow"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>ቀጥታ Webhook (Apps Script)</span>
            </button>

            <button
              onClick={() => setActiveTab("winners")}
              className={`flex-1 py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "winners"
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 shadow"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>የተመዘገቡ አሸናፊዎች ({totalCount})</span>
            </button>
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
                statusMsg.type === "success"
                  ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                  : "bg-rose-950/60 border-rose-500/50 text-rose-300"
              }`}
            >
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* TAB 1: Google Sheet OAuth Connection */}
          {activeTab === "sheet" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>የባለቤቱ Google አካውንት ({ownerEmail})</span>
                  </span>
                  {currentUser ? (
                    <span className="text-[11px] text-emerald-400 font-bold">
                      ተገናኝቷል ({currentUser.email})
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-400">አልተገናኘም</span>
                  )}
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  በ Google መግባትዎን ሲያረጋግጡ{" "}
                  <strong className="text-amber-300 font-bold">
                    "Habesha Beer - የበሬ ሥጋ ክፍሎች አሸናፊዎች"
                  </strong>{" "}
                  የሚል ሰንጠረዥ በ Google Drive ላይ በቀጥታ ይዘጋጅልዎታል ወይም ይገናኛል።
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleConnectGoogle}
                    disabled={isLoading}
                    className="py-2 px-3.5 rounded-xl bg-white hover:bg-stone-100 text-stone-900 text-xs font-bold transition flex items-center gap-2 active:scale-95 shadow"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    <span>በGoogle አገናኝ (Connect with Google)</span>
                  </button>

                  {spreadsheetId && (
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3.5 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Sheet className="w-3.5 h-3.5" />
                      <span>ሰንጠረዡን በGoogle Drive ክፈት</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Spreadsheet ID Direct Setting */}
              <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2">
                <label className="block text-xs font-bold text-stone-300">
                  የGoogle Sheet መለያ (Spreadsheet ID)
                </label>
                <input
                  type="text"
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  placeholder="ለምሳሌ፡ 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-xs font-mono focus:border-amber-400 focus:outline-none"
                />
                <button
                  onClick={handleSaveConfig}
                  className="py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold transition flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>መታወቂያውን አስቀምጥ</span>
                </button>
              </div>

              {/* Sync Button */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-amber-300">
                    ሁሉንም የተመዘገቡ ተጫዋቾች ወደ Google Sheet አስተላልፍ
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    በሰርቨሩ የተመዘገቡትን {totalCount} ተወዳዳሪዎች በአንድ ጊዜ ወደ ሰንጠረዡ ይልካል
                  </p>
                </div>
                <button
                  onClick={handleSyncAllToGoogle}
                  disabled={isLoading || totalCount === 0}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 font-bold text-xs shadow active:scale-95 transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>አሁን አስተላልፍ (Sync All)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Apps Script Webhook (Zero Login for Players) */}
          {activeTab === "webhook" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>ምንም መግባት ሳያስፈልግ በቀጥታ ወደ Google Sheet መመዝገቢያ (Apps Script)</span>
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  ተጫዋቾች ስማቸውንና ስልካቸውን ሲያስገቡ የ Google መግቢያ ጥያቄ ሳይመጣባቸው በቀጥታ ወደ እርስዎ Google Sheet እንዲገባ ይህን ቆንጆ ዘዴ ይጠቀሙ፦
                </p>

                <ol className="text-xs text-stone-300 space-y-1 list-decimal list-inside bg-stone-950/70 p-3 rounded-xl border border-stone-800">
                  <li>የእርስዎን Google Sheet በኮምፒውተር ወይም በስልክ ይክፈቱ።</li>
                  <li>ከላይ <strong>Extensions &gt; Apps Script</strong> የሚለውን ይጫኑ።</li>
                  <li>የታየውን ኮድ ሰርዘው ከታች ያለውን ኮድ <strong>ኮፒ</strong> አድርገው ይለጥፉ።</li>
                  <li>
                    በቀኝ በኩል <strong>Deploy &gt; New deployment &gt; Web app</strong> ይምረጡ፤
                    <strong>Who has access</strong> የሚለውን <strong>Anyone</strong> አድርገው <strong>Deploy</strong> ይጫኑ።
                  </li>
                  <li>የተሰጠዎትን <strong>Web App URL</strong> ከታች ባለው ሳጥን ውስጥ አስገብተው ያስቀምጡ!</li>
                </ol>

                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-stone-400">የ Apps Script ኮድ:</span>
                    <button
                      onClick={copyAppsScript}
                      className="py-1 px-2.5 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-bold hover:bg-amber-500/30 transition flex items-center gap-1"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? "ተቀድቷል (Copied!)" : "ኮዱን ቅዳ (Copy Code)"}</span>
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono bg-black p-3 rounded-xl border border-stone-800 text-stone-300 overflow-x-auto max-h-36">
                    {appsScriptCode}
                  </pre>
                </div>

                {/* Input for Webhook URL */}
                <div className="pt-2 space-y-1.5">
                  <label className="block text-xs font-bold text-amber-300">
                    የተገኘው የ Web App URL (Google Apps Script Endpoint)
                  </label>
                  <input
                    type="url"
                    value={sheetWebhookUrl}
                    onChange={(e) => setSheetWebhookUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveConfig}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 font-bold text-xs shadow active:scale-95 transition flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>የ Webhook ሊንኩን አስቀምጥ (Save Webhook)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Winners List & CSV Download */}
          {activeTab === "winners" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    የተመዘገቡ ተወዳዳሪዎች ዝርዝር ({winners.length})
                  </span>
                  <span className="text-[11px] text-stone-400">
                    ስም፣ ስልክ ቁጥር፣ ጾታ እና ያሸነፉት የሥጋ ክፍል
                  </span>
                </div>

                <a
                  href="/api/export-csv"
                  download
                  className="py-2 px-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>በ Excel / CSV አውርድ</span>
                </a>
              </div>

              {winners.length === 0 ? (
                <div className="p-8 text-center text-stone-500 text-xs rounded-2xl bg-stone-950 border border-stone-800">
                  እስካሁን የተመዘገበ ተወዳዳሪ የለም። ጥያቄዎች ሲመለሱ እዚህ ይመዘገባሉ!
                </div>
              ) : (
                <div className="border border-stone-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-950 border-b border-stone-800 text-[11px] text-amber-300">
                      <tr>
                        <th className="p-2.5">ስም</th>
                        <th className="p-2.5">ስልክ</th>
                        <th className="p-2.5">ጾታ</th>
                        <th className="p-2.5">ክፍል</th>
                        <th className="p-2.5 text-right">ቢራ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-900 bg-stone-950/40">
                      {winners.map((w, idx) => (
                        <tr key={idx} className="hover:bg-stone-900/60">
                          <td className="p-2.5 font-bold text-white">{w.name}</td>
                          <td className="p-2.5 font-mono text-stone-300">{w.phoneNumber}</td>
                          <td className="p-2.5 text-stone-400">{w.gender}</td>
                          <td className="p-2.5 text-amber-300">
                            #{w.cutId} {w.cutName}
                          </td>
                          <td className="p-2.5 font-mono text-amber-400 font-bold text-right">
                            {w.totalBeers} 🍺
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
