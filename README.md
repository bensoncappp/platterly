# Platterly

**Meal prep, made simple.**

Platterly turns a craving typed in plain words into three AI-generated meals, each with ingredients, gram amounts, macros and a plate image. Sign in with Google to save meals and group them on boards.

## How it works

```
Browser → type a craving → /api/parse-query (Gemini) → /api/generate-meal (Gemini, totals summed in code) → /api/plate-image (Cloudflare Workers AI) → meal cards
Browser → click Save → /api/meals → Supabase (Postgres + Storage) → Saved list and Boards
```

## Stack

- Next.js 16 (App Router, TypeScript, CSS modules)
- Supabase: Postgres, Storage, Auth (Google)
- Gemini for meal generation
- Cloudflare Workers AI (FLUX.1 schnell) for plate images
- Vercel for hosting

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Create a `.env.local` file with your own keys. Never commit it.

| Variable | What it is |
| --- | --- |
| `GEMINI_API_KEY` | Google AI Studio key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | Cloudflare token with Workers AI permission |
| `ENABLE_IMAGE_GENERATION` | Set to turn plate images on or off |

## Database

See [`docs/erd.md`](docs/erd.md).
