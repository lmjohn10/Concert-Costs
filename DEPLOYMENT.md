# Deploy Concert Cost Tracker to Vercel

Plain-English steps to put your app online.

## Before you start

You need:

1. A [Vercel](https://vercel.com) account (free tier is fine)
2. Your code on **GitHub** (repo: `Concert-Costs`)
3. Your Supabase **Project URL** and **publishable / anon key** (same as `.env.local`)

---

## Step 1 — Push your latest code to GitHub

If you use **GitHub Desktop** or **Cursor’s Source Control**:

1. Open the `Concert-Costs` folder as the project
2. Commit all changed files with a message like `Ready for Vercel deploy`
3. Push to `main` on GitHub (`lmjohn10/Concert-Costs` or your fork)

If the repo root on GitHub is the `Concert-Costs` folder (not the parent `Concert costs` folder), that’s correct for Vercel.

---

## Step 2 — Import the project on Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **Import** next to your **Concert-Costs** GitHub repository
3. **Root Directory:** leave as `.` if the repo only contains the Next.js app.  
   If the repo includes a parent folder, set root to **`Concert-Costs`**
4. **Framework Preset:** Next.js (auto-detected)
5. **Build Command:** `npm run build` (default)
6. **Output Directory:** leave default (Next.js handles this)

Do **not** deploy yet — add environment variables first.

---

## Step 3 — Add environment variables on Vercel

In the import screen (or later: Project → **Settings** → **Environment Variables**), add:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://pobvvqeznubzxftpusqf.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your publishable or anon key from Supabase |

Use the same values as in your local `.env.local`.  
Apply to **Production**, **Preview**, and **Development**.

Then click **Deploy**.

---

## Step 4 — Configure Supabase for your live URL

After the first deploy, Vercel gives you a URL like:

`https://concert-costs-xxxxx.vercel.app`

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → **Concert Costs** project
2. Go to **Authentication** → **URL Configuration**
3. Set **Site URL** to your Vercel URL (e.g. `https://concert-costs-xxxxx.vercel.app`)
4. Under **Redirect URLs**, add:
   - `https://concert-costs-xxxxx.vercel.app/**`
   - `http://localhost:3000/**` (keep this for local testing)

Save.

---

## Step 5 — Test the live site

1. Open your Vercel URL
2. Sign up or log in
3. Add a concert, check Dashboard, Deals, Memories, What-If

If login fails, double-check Step 3 and Step 4.

---

## Optional — Deploy from your computer (CLI)

```bash
cd Concert-Costs
npm install -g vercel
vercel login
vercel
```

Follow prompts. Add env vars in the Vercel dashboard when asked or afterward.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on Vercel | Open failed deployment → **Building** → read the red error line |
| `No Next.js version detected` | **Root Directory** must be `Concert-Costs` (folder with `package.json`) |
| Empty site / 404 | Same — wrong root folder deployed |
| Missing env / Supabase error | Add both `NEXT_PUBLIC_*` variables in Vercel, then **Redeploy** |
| Login works locally but not online | Update Supabase **Site URL** and **Redirect URLs** |
| Wrong folder deployed | Vercel → Settings → General → **Root Directory** → `Concert-Costs` |

### Vercel settings checklist

- **Root Directory:** `Concert-Costs` (if your GitHub repo is the parent folder) or `.` (if the repo is only the app)
- **Framework:** Next.js
- **Node.js Version:** 20.x (Project → Settings → General)
- **Build Command:** `npm run build` (default — uses webpack for stability)
- **Environment variables:** both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production

After fixing settings, click **Deployments** → latest failed deploy → **Redeploy**.

---

## Security reminder

Never add **service role** or **secret** keys to Vercel for this app. Only the two `NEXT_PUBLIC_` variables above.
