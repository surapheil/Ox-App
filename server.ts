import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Persistent store for all winners
const DATA_DIR = path.join(__dirname, "data");
const WINNERS_FILE = path.join(DATA_DIR, "winners.json");
const CONFIG_FILE = path.join(DATA_DIR, "sheet_config.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(WINNERS_FILE)) {
  fs.writeFileSync(WINNERS_FILE, JSON.stringify([], null, 2), "utf-8");
}

if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(
    CONFIG_FILE,
    JSON.stringify(
      {
        ownerEmail: "surafellamesgin@gmail.com",
        sheetWebhookUrl: process.env.GOOGLE_SHEETS_WEBHOOK_URL || "",
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || "",
      },
      null,
      2
    ),
    "utf-8"
  );
}

const getWinners = (): any[] => {
  try {
    const raw = fs.readFileSync(WINNERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveWinners = (winners: any[]) => {
  fs.writeFileSync(WINNERS_FILE, JSON.stringify(winners, null, 2), "utf-8");
};

const getConfig = () => {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      ownerEmail: "surafellamesgin@gmail.com",
      sheetWebhookUrl: "",
      spreadsheetId: "",
    };
  }
};

const saveConfig = (cfg: any) => {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), "utf-8");
};

// API: Record a new winner entry
app.post("/api/winners", async (req: Request, res: Response) => {
  try {
    const {
      name,
      phoneNumber,
      gender,
      cutName,
      cutId,
      trophyWon,
      totalBeers,
      rankTitle,
      timestamp,
    } = req.body;

    if (!name || !phoneNumber) {
      return res.status(400).json({ error: "Name and phone number are required" });
    }

    const newEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: timestamp || new Date().toLocaleString("en-US", { timeZone: "Africa/Addis_Ababa" }),
      name: String(name).trim(),
      phoneNumber: String(phoneNumber).trim(),
      gender: gender ? String(gender).trim() : "ያልተገለጸ",
      cutName: cutName || "",
      cutId: cutId || 0,
      trophyWon: trophyWon || "ቀዝቃዛው ሐበሻ ቢራ",
      totalBeers: Number(totalBeers) || 1,
      rankTitle: rankTitle || "ጀማሪ አራጅ",
    };

    const winners = getWinners();
    winners.unshift(newEntry);
    saveWinners(winners);

    // If a Google Apps Script Webhook is configured, forward immediately to the owner's Google Sheet
    const config = getConfig();
    let sheetSynced = false;
    if (config.sheetWebhookUrl) {
      try {
        const sheetRes = await fetch(config.sheetWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntry),
        });
        if (sheetRes.ok) {
          sheetSynced = true;
        }
      } catch (sheetErr) {
        console.warn("Failed to forward to Google Sheets webhook:", sheetErr);
      }
    }

    return res.status(201).json({
      success: true,
      entry: newEntry,
      sheetSynced,
      totalEntries: winners.length,
    });
  } catch (err: any) {
    console.error("Error saving winner:", err);
    return res.status(500).json({ error: "Failed to record winner" });
  }
});

// API: List all recorded winners
app.get("/api/winners", (req: Request, res: Response) => {
  try {
    const winners = getWinners();
    const config = getConfig();
    return res.json({
      winners,
      count: winners.length,
      ownerEmail: config.ownerEmail,
      hasWebhook: Boolean(config.sheetWebhookUrl),
      spreadsheetId: config.spreadsheetId,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch winners" });
  }
});

// API: Get and Update Owner Sheet Configuration
app.get("/api/config", (req: Request, res: Response) => {
  return res.json(getConfig());
});

app.post("/api/config", (req: Request, res: Response) => {
  try {
    const { sheetWebhookUrl, spreadsheetId, ownerEmail } = req.body;
    const current = getConfig();
    const updated = {
      ...current,
      sheetWebhookUrl: sheetWebhookUrl !== undefined ? sheetWebhookUrl : current.sheetWebhookUrl,
      spreadsheetId: spreadsheetId !== undefined ? spreadsheetId : current.spreadsheetId,
      ownerEmail: ownerEmail || current.ownerEmail,
    };
    saveConfig(updated);
    return res.json({ success: true, config: updated });
  } catch (err) {
    return res.status(500).json({ error: "Failed to save config" });
  }
});

// API: Export all winners as UTF-8 CSV (with BOM so Excel & Google Sheets open Amharic perfectly)
app.get("/api/export-csv", (req: Request, res: Response) => {
  try {
    const winners = getWinners();
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

    // UTF-8 BOM
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="habesha_beer_winners_${Date.now()}.csv"`
    );
    return res.send(csvContent);
  } catch (err) {
    return res.status(500).send("Error generating CSV");
  }
});

// API: Download clean GitHub-ready project ZIP archive
app.get("/api/download-zip", (req: Request, res: Response) => {
  try {
    const zipPath = "/tmp/habesha-beer-ox-cuts-github.zip";
    const pyScript = `
import os, zipfile
root = ${JSON.stringify(__dirname)}
out_zip = ${JSON.stringify(zipPath)}
exclude_dirs = {"node_modules", "dist", "data", ".git", ".aistudio", ".vercel"}
exclude_files = {"server.js", ".env", ".env.local"}
with zipfile.ZipFile(out_zip, "w", zipfile.ZIP_DEFLATED) as zf:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
        for f in filenames:
            if f in exclude_files or f.endswith(".zip"):
                continue
            full = os.path.join(dirpath, f)
            rel = os.path.relpath(full, root)
            zf.write(full, os.path.join("habesha-beer-ox-cuts", rel))
`;
    execFileSync("python3", ["-c", pyScript]);
    return res.download(zipPath, "habesha-beer-ox-cuts-github.zip");
  } catch (err) {
    console.error("Error generating ZIP:", err);
    return res.status(500).json({ error: "Failed to generate ZIP archive" });
  }
});

// Mount Vite or static server
async function setupServer() {
  if (process.env.NODE_ENV === "production") {
    // Serve production build
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Vite middleware for development
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== "true" },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

setupServer();
