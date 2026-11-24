import fs from "fs";
import path from "path";

const WINNERS_FILE = path.join("/tmp", "habesha_winners.json");

function readWinners(): any[] {
  try {
    if (fs.existsSync(WINNERS_FILE)) {
      return JSON.parse(fs.readFileSync(WINNERS_FILE, "utf-8"));
    }
  } catch {
    // ignore
  }
  return [];
}

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const winners = readWinners();
  const headers = [
    "ቀንና ሰዓት (Timestamp)",
    "የተጫዋች ስም (Player Name)",
    "ስልክ ቁጥር (Phone Number)",
    "ጾታ (Gender)",
    "የተመለሰ የሥጋ ክፍል (Ox Cut)",
    "ክፍል ቁጥር (Cut #)",
    "የተሸለመው ዋንጫ/ቢራ (Trophy Won)",
    "ድምር ሐበሻ ቢራ (Total Beers)",
    "የማዕረግ ደረጃ (Rank)",
  ];

  const rows = winners.map((w) => [
    `"${(w.timestamp || "").replace(/"/g, '""')}"`,
    `"${(w.name || "").replace(/"/g, '""')}"`,
    `"${(w.phoneNumber || "").replace(/"/g, '""')}"`,
    `"${(w.gender || "").replace(/"/g, '""')}"`,
    `"${(w.cutName || "").replace(/"/g, '""')}"`,
    `"${w.cutId || ""}"`,
    `"${(w.trophyWon || "").replace(/"/g, '""')}"`,
    `"${w.totalBeers || 0}"`,
    `"${(w.rankTitle || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="habesha_beer_winners_${Date.now()}.csv"`
  );
  return res.status(200).send(csvContent);
}
