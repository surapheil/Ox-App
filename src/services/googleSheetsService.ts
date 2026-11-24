import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

export const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

// Memory caching for access token (never persist in localStorage as per skill guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface WinnerEntry {
  name: string;
  phoneNumber: string;
  gender: string; // 'ወንድ (Male)' | 'ሴት (Female)'
  cutName: string;
  cutId: number;
  trophyWon: string;
  totalBeers: number;
  rankTitle: string;
  timestamp?: string;
}

// Auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get Google access token");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

const SPREADSHEET_TITLE = "Habesha Beer - የበሬ ሥጋ ክፍሎች አሸናፊዎች (Winners & Analysis)";
const SPREADSHEET_ID_KEY = "habesha_quiz_google_sheet_id";

/**
 * Finds existing or creates a new Google Spreadsheet for Habesha Beer winners
 */
export const getOrCreateSpreadsheet = async (accessToken: string): Promise<string> => {
  // Check stored ID first
  const storedId = localStorage.getItem(SPREADSHEET_ID_KEY);
  if (storedId) {
    try {
      const checkRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${storedId}?fields=spreadsheetId,properties.title`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (checkRes.ok) {
        return storedId;
      }
    } catch {
      // Fallback to searching or creating
    }
  }

  // Search existing file in user's Drive with this title
  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(
        SPREADSHEET_TITLE
      )}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const foundId = searchData.files[0].id;
        localStorage.setItem(SPREADSHEET_ID_KEY, foundId);
        return foundId;
      }
    }
  } catch (err) {
    console.warn("Drive search error, proceeding to create sheet:", err);
  }

  // Create new Spreadsheet
  const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_TITLE,
      },
      sheets: [
        {
          properties: {
            title: "አሸናፊዎች (Winners)",
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Sheet: ${errText}`);
  }

  const createData = await createRes.json();
  const newSheetId = createData.spreadsheetId;
  localStorage.setItem(SPREADSHEET_ID_KEY, newSheetId);

  // Initialize Header Row with Habesha Gold & Obsidian theme
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

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${newSheetId}/values/'አሸናፊዎች (Winners)'!A1:I1?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [headers],
      }),
    }
  );

  return newSheetId;
};

/**
 * Appends a winner record row to the Google Sheet
 */
export const appendWinnerToGoogleSheet = async (
  accessToken: string,
  entry: WinnerEntry,
  customSheetId?: string
): Promise<{ spreadsheetId: string; updatedRange: string }> => {
  const spreadsheetId = customSheetId || (await getOrCreateSpreadsheet(accessToken));

  const timestamp = entry.timestamp || new Date().toLocaleString("en-US", { timeZoneName: "short" });
  const rowData = [
    timestamp,
    entry.name,
    entry.phoneNumber,
    entry.gender,
    entry.cutName,
    `#${entry.cutId}`,
    entry.trophyWon,
    entry.totalBeers,
    entry.rankTitle,
  ];

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'አሸናፊዎች (Winners)'!A:I:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [rowData],
      }),
    }
  );

  if (!appendRes.ok) {
    const errText = await appendRes.text();
    throw new Error(`Failed to append row to Google Sheet: ${errText}`);
  }

  const appendData = await appendRes.json();
  return {
    spreadsheetId,
    updatedRange: appendData.updates?.updatedRange || "",
  };
};

/**
 * Record a winner to the server database (ensures all submissions from any player are saved permanently)
 */
export const recordWinnerToServer = async (entry: WinnerEntry): Promise<any> => {
  try {
    const res = await fetch("/api/winners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!res.ok) {
      console.warn("Server record returned non-ok status:", res.status);
    }
    return await res.json();
  } catch (err) {
    console.error("Failed to post winner to server:", err);
    return null;
  }
};

/**
 * Fetch all registered winners from server
 */
export const fetchServerWinners = async (): Promise<{
  winners: WinnerEntry[];
  count: number;
  ownerEmail?: string;
  hasWebhook?: boolean;
  spreadsheetId?: string;
}> => {
  try {
    const res = await fetch("/api/winners");
    if (!res.ok) throw new Error("Failed to load winners");
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch server winners:", err);
    return { winners: [], count: 0 };
  }
};

/**
 * Get and update server configuration for the owner's Google Sheet
 */
export const getServerConfig = async () => {
  try {
    const res = await fetch("/api/config");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export const updateServerConfig = async (config: {
  sheetWebhookUrl?: string;
  spreadsheetId?: string;
  ownerEmail?: string;
}) => {
  try {
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    return await res.json();
  } catch (err) {
    console.error("Failed to update config:", err);
    return null;
  }
};

/**
 * Batch sync all winners recorded on the server to the owner's Google Sheet
 */
export const syncAllWinnersToGoogleSheet = async (
  accessToken: string,
  winners: WinnerEntry[],
  sheetId?: string
): Promise<{ count: number; spreadsheetId: string }> => {
  const targetSheetId = sheetId || (await getOrCreateSpreadsheet(accessToken));

  if (!winners || winners.length === 0) {
    return { count: 0, spreadsheetId: targetSheetId };
  }

  const rows = winners.map((entry) => [
    entry.timestamp || new Date().toLocaleString("en-US", { timeZoneName: "short" }),
    entry.name,
    entry.phoneNumber,
    entry.gender,
    entry.cutName,
    `#${entry.cutId}`,
    entry.trophyWon,
    entry.totalBeers,
    entry.rankTitle,
  ]);

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${targetSheetId}/values/'አሸናፊዎች (Winners)'!A:I:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!appendRes.ok) {
    const errText = await appendRes.text();
    throw new Error(`Failed to batch sync to Google Sheet: ${errText}`);
  }

  return { count: rows.length, spreadsheetId: targetSheetId };
};

