import fs from "fs";
import path from "path";

const CONFIG_FILE = path.join("/tmp", "habesha_config.json");

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
    sheetWebhookUrl:
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      "https://script.google.com/macros/s/AKfycbzZeRNmtBNTBFleAF51r7wL_sNXgaR6tVDGYWpR7pCSPqO-yczwhatQEsXB6ko1zKxG/exec",
    spreadsheetId:
      process.env.GOOGLE_SPREADSHEET_ID ||
      "17XZUgkKW5YqXtVRT4zIOk9tSruhXYBc-1V76yXSYpB0",
  };
}

export default function handler(req: any, res: any) {
  if (req.method === "GET") {
    return res.status(200).json(readConfig());
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const { sheetWebhookUrl, spreadsheetId, ownerEmail } = body;
      const current = readConfig();
      const updated = {
        ...current,
        sheetWebhookUrl:
          sheetWebhookUrl !== undefined ? sheetWebhookUrl : current.sheetWebhookUrl,
        spreadsheetId:
          spreadsheetId !== undefined ? spreadsheetId : current.spreadsheetId,
        ownerEmail: ownerEmail || current.ownerEmail,
      };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8");
      return res.status(200).json({ success: true, config: updated });
    } catch {
      return res.status(500).json({ error: "Failed to save config" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
