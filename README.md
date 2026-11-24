# Habesha Beer — የበሬ ሥጋ ክፍሎች (Ethiopian Ox Cuts Quiz)

A luxury gold-and-black responsive web app built for Habesha Beer where players guess the 10 traditional Ethiopian ox meat cuts in Amharic, win cold Habesha Beer awards, and register their details directly into a centralized Google Sheet.

## Deploy to GitHub & Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Habesha Beer Ox Cuts Quiz"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
2. Vercel automatically detects `vercel.json` (`vite` framework, `npx vite build`, `dist` output, and `/api/*` serverless functions).
3. *(Optional)* In Vercel **Project Settings → Environment Variables**, add:
   - `GOOGLE_SHEETS_WEBHOOK_URL`: Your Google Apps Script Web App URL so every winner submission saves directly to your Google Sheet.
   - `GOOGLE_SPREADSHEET_ID`: Your Google Sheet ID.
4. Click **Deploy**.
