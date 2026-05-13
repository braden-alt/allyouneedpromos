# HMH Tools

Internal operating system for HMH Holdings. Five tools, one deploy.

- **Outbound Engine** — `/outbound`
- **Reply Handler** — `/reply`
- **Quote Engine** — `/quote`
- **Mockup Studio** — `/mockup`
- **Idea Generator** — `/ideas`

---

## 🚀 Deploy in 20 minutes (read this once, follow it once)

### Step 1 — Create a GitHub account (skip if you have one)

Go to **github.com** → Sign up. Use the email you want to manage this with (sales@swagrshop.com works fine).

### Step 2 — Create a new repo

1. Click the **+** in the top right → **New repository**
2. Repository name: `hmh-tools`
3. Privacy: **Private** (this is internal, don't make it public)
4. Don't check "Add a README" — we already have one
5. Click **Create repository**

GitHub now shows you a "quick setup" page. Leave that tab open.

### Step 3 — Upload these files to the repo

The easiest path (no terminal needed):

1. On the quick setup page, click **uploading an existing file**
2. Drag the ENTIRE `hmh-tools` folder contents into the upload area
3. Scroll down → **Commit changes**

Wait 30 seconds. Refresh the page. You should see all the files.

### Step 4 — Connect to Vercel

1. Go to **vercel.com** → Sign up with **Continue with GitHub**
2. Authorize Vercel
3. On the Vercel dashboard, click **Add New → Project**
4. Find `hmh-tools` in your repo list → **Import**
5. Framework Preset should auto-detect **Next.js** — leave everything default
6. Click **Deploy**

Wait 2-3 minutes. Vercel builds and deploys.

### Step 5 — You're live

Vercel gives you a URL like `hmh-tools-xyz.vercel.app`. That's your operating system.

- Visit `/` for the dashboard
- Visit `/outbound`, `/reply`, `/quote`, `/mockup`, `/ideas` for each tool
- Bookmark on your phone — works like a real app
- Share the URL with Kimberly — she has the same access

---

## 🔧 How to update tools later

The tools live in `app/[name]/page.jsx`. If you ever want to tune a prompt or change copy:

1. Edit the file on github.com directly (pencil icon on the file)
2. Commit
3. Vercel rebuilds automatically (2 min) and ships the change

No re-deploy needed. No terminal needed.

---

## 🌐 Custom domain (optional, $12/yr)

Want it to live at `tools.hmhholdings.com` instead of vercel.app?

1. In Vercel project → **Settings → Domains → Add**
2. Type `tools.hmhholdings.com`
3. Vercel gives you DNS records to add at GoDaddy
4. Add them to the hmhholdings.com domain → wait 5 minutes
5. Done

---

## 💸 Cost

- **Vercel:** Free forever for your usage volume (Hobby plan)
- **GitHub:** Free
- **Custom domain (optional):** $12/yr at GoDaddy

Total: **$0** unless you want a custom domain.

---

## 🛟 If something breaks

- **Build fails on Vercel:** Check the build log. Usually a typo in a file you edited.
- **A page shows an error:** Open browser console (F12). The error tells you which file/line.
- **API calls fail in a tool:** Tools that call Claude API (Outbound, Reply, Ideas) need to run inside Claude.ai context. The Anthropic API key is handled there. If you're testing standalone, those features won't work — but Quote Engine and Mockup Studio work standalone since they're pure calculators.

---

## 📁 What's in this repo

```
hmh-tools/
├── app/
│   ├── layout.jsx          ← wraps every page
│   ├── page.jsx            ← homepage / dashboard
│   ├── globals.css         ← Tailwind base
│   ├── outbound/page.jsx   ← Outbound Engine
│   ├── reply/page.jsx      ← Reply Handler
│   ├── quote/page.jsx      ← Quote Engine
│   ├── mockup/page.jsx     ← Mockup Studio
│   └── ideas/page.jsx      ← Idea Generator
├── package.json            ← dependencies
├── next.config.js          ← Next.js config
├── tailwind.config.js      ← styling
├── postcss.config.js       ← CSS processing
├── jsconfig.json           ← path aliases
└── README.md               ← this file
```

---

## 🧠 The brain layer

The 5 tools are the hands. The brain is the **HMH Operating System** Project on Claude.ai with 21 skills loaded. Use both together — Claude for ambiguous asks (paste an email, get a draft), tools for repetitive work (quote, mockup, sequence).

Skills + tools = the operating system. Either alone is half a system.

---

*Built for Braden Forge · HMH Holdings · 2026*
