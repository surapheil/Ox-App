import fs from "fs";
import path from "path";

const TMP_DIR = "/tmp";
const WINNERS_FILE = path.join(TMP_DIR, "habesha_winners.json");
const CONFIG_FILE = path.join(TMP_DIR, "habesha_config.json");

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

function writeWinners(winners: any[]) {
  try {
    fs.writeFileSync(WINNERS_FILE, JSON.stringify(winners, null, 2), "utf-8");
  } catch {
    // ignore
  }
}

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    }
  } catch {
    // ignore
  }
  return {
    ownerEmail: "surafellamesgin@gmail.com",
    sheetWebhookUrl: process.env.GOOGLE_SHEETS_WEBHOOK_URL || "",
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || "",
  };
}

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    const winners = readWinners();
    const config = readConfig();
    return res.status(200).json({
      winners,
      count: winners.length,
      ownerEmail: config.ownerEmail,
      hasWebhook: Boolean(config.sheetWebhookUrl),
      spreadsheetId: config.spreadsheetId,
    });
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
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
      } = body;

      if (!name || !phoneNumber) {
        return res.status(400).json({ error: "Name and phone number are required" });
      }

      const newEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp:
          timestamp ||
          new Date().toLocaleString("en-US", { timeZone: "Africa/Addis_Ababa" }),
        name: String(name).trim(),
        phoneNumber: String(phoneNumber).trim(),
        gender: gender ? String(gender).trim() : "ያልተገለጸ",
        cutName: cutName || "",
        cutId: cutId || 0,
        trophyWon: trophyWon || "ቀዝቃዛው ሐበሻ ቢራ",
        totalBeers: Number(totalBeers) || 1,
        rankTitle: rankTitle || "ጀማሪ ተመጋቢ",
      };

      const winners = readWinners();
      winners.unshift(newEntry);
      writeWinners(winners);

      const config = readConfig();
      let sheetSynced = false;
      const webhookUrl =
        config.sheetWebhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          const sheetRes = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newEntry),
          });
          if (sheetRes.ok) {
            sheetSynced = true;
          }
        } catch (err) {
          console.warn("Webhook forward failed:", err);
        }
      }

      return res.status(201).json({
        success: true,
        entry: newEntry,
        sheetSynced,
        totalEntries: winners.length,
      });
    } catch (err) {
      console.error("Error saving winner:", err);
      return res.status(500).json({ error: "Failed to record winner" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
