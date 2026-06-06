# LifeFlow — Personal Track

Finance & wellness dashboard for tracking accounts, habits, and reminders.

## Features

- **Unified Dashboard** — net worth, hydration, sleep, and task overview
- **Finance Tracker** — accounts, transactions, savings goals
- **Health & Wellness** — sleep timer, intermittent fasting, water intake
- **Reminders & Tasks** — categorized to-do list with priorities

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```

## Supabase project

This repo uses the **personal-track** Supabase project (not dripsprinting):

| Setting | Value |
|---------|-------|
| Project | `personal-track` |
| Ref | `azsahxubolokhkhnbbzo` |
| URL | `https://azsahxubolokhkhnbbzo.supabase.co` |
| Dashboard | [Open project](https://supabase.com/dashboard/project/azsahxubolokhkhnbbzo) |

Copy `.env.example` to `.env.local` and paste your **anon** and **service_role** keys from the Supabase dashboard (Settings → API).

Link the CLI (must be logged into the **Website Project** org):

```bash
npm run link:supabase
```

## Deploy

**Vercel (recommended frontend host):**

```bash
npm run deploy:vercel
```

**Supabase Storage (static build upload):**

```bash
npm run deploy:supabase
```

Requires `SUPABASE_SERVICE_ROLE_KEY` in your environment (from the personal-track project API settings).
