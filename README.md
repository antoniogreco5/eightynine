# EightyNine v2 — Portfolio Diversification Engine

Live prices, Google sign-in, persistent portfolios, and premium UI.

---

## Setup Guide (Do These in Order)

### 1. Get a Finnhub API Key (free — 2 minutes)

1. Go to [finnhub.io](https://finnhub.io)
2. Click **Get free API key**
3. Sign up with email
4. Copy your API key — you'll need it later

### 2. Get Google OAuth Credentials (~5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a **New Project** (name it "EightyNine" or whatever)
3. Go to **OAuth consent screen** → choose **External** → fill in app name + your email → Save
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Add these under **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
   - `https://YOUR-APP.vercel.app/api/auth/callback/google` (add after Vercel deploy)
7. Copy the **Client ID** and **Client Secret**

### 3. Deploy to Vercel

1. Push this code to GitHub (see terminal commands below)
2. Go to [vercel.com/new](https://vercel.com/new) → import your repo
3. **Before clicking Deploy**, go to the **Environment Variables** section and add:

| Variable | Value |
|----------|-------|
| `GOOGLE_CLIENT_ID` | Your Google client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google client secret |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` in terminal, paste result |
| `FINNHUB_API_KEY` | Your Finnhub API key |
| `NEXTAUTH_URL` | `https://YOUR-APP.vercel.app` (update after deploy with your actual URL) |

4. Click **Deploy**

### 4. Set Up the Database

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **Create** → choose **Postgres**
3. Follow the prompts to create a database
4. Vercel automatically adds `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` to your env vars
5. In the Vercel dashboard, go to **Settings** → **General** → find **Build Command** and set it to:
   ```
   prisma generate && prisma db push && next build
   ```
6. **Redeploy** the project (go to Deployments → click the three dots → Redeploy)

### 5. Update Google OAuth Redirect

After deploy, go back to Google Cloud Console and add your live URL:
```
https://YOUR-APP.vercel.app/api/auth/callback/google
```

---

## Push to GitHub (Terminal Commands)

```bash
cd ~/Desktop/eightynine
npm install
git init
git add .
git commit -m "EightyNine v2"
git remote add origin https://github.com/antoniogreco5/eightynine.git
git branch -M main
git push -u origin main --force
```

---

## Local Development

```bash
cp .env.example .env
# Fill in your env values in .env
npm install
npx prisma db push
npm run dev
```

---

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Landing page with Google sign-in
│   ├── dashboard/page.tsx    # Main dashboard (auth-protected)
│   └── api/
│       ├── auth/[...nextauth]/  # NextAuth handler
│       ├── prices/              # Finnhub price proxy with caching
│       └── portfolio/           # CRUD for holdings (Prisma + Postgres)
├── components/                  # All UI (redesigned)
├── hooks/usePortfolio.ts        # Central state + API calls + live prices
└── lib/
    ├── auth.ts                  # NextAuth config
    ├── prisma.ts                # Database client
    ├── config.ts                # Rule thresholds (5% / 20%)
    ├── rules.ts                 # Rule engine
    ├── calculations.ts          # Portfolio math
    ├── recommendations.ts       # Plain-English advice
    ├── tickerMap.ts             # ~300 ticker → sector auto-mapping
    └── sampleData.ts            # Demo portfolio
```

---

## Tech Stack

- **Next.js 14** (App Router)
- **NextAuth.js** (Google OAuth)
- **Prisma** + **Vercel Postgres**
- **Finnhub API** (live stock prices, free tier)
- **TypeScript** (strict)
- **Tailwind CSS** (premium dark theme)
