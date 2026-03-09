# COPILOT.md — Badge App Reference

This file is a quick reference for GitHub Copilot to understand the project without re-reading all files every session.

---

## Project Overview

**Name:** badge-app  
**Purpose:** Demo Next.js app (no database) that lets a user fill in a form to generate a digital badge/ID card, then add it to Google Wallet.  
**Status:** Steps 1 & 2 complete and deployed to Vercel. Step 3 (Apple Wallet) skipped — requires paid Apple Developer account.

---

## Tech Stack

| Layer         | Tech                                                   |
| ------------- | ------------------------------------------------------ |
| Framework     | Next.js 16.1.6 (App Router)                            |
| Language      | TypeScript 5                                           |
| Styling       | Tailwind CSS v4 (via `@tailwindcss/postcss`)           |
| Fonts         | Geist Sans + Geist Mono (Google Fonts via `next/font`) |
| QR Code       | `react-qr-code` ^2.0.18                                |
| UUID          | `uuid` ^13.0.0 + `@types/uuid`                         |
| Google Wallet | `google-auth-library` (JWT signing)                    |
| React         | 19.2.3                                                 |

---

## Folder Structure (current)

```
badge-app/
├── app/
│   ├── api/
│   │   └── google-wallet/
│   │       └── route.ts    # POST — signs Google Wallet Generic Pass JWT, returns saveUrl
│   ├── components/
│   │   ├── BadgeCard.tsx    # Large ID card — gradient header, avatar, name, title, age, UUID
│   │   ├── BadgeForm.tsx    # Form — name, age, title, photo upload → generates UUID on submit
│   │   └── BadgeMini.tsx    # Small wallet badge — avatar, info, QR code, wallet buttons
│   ├── types/
│   │   └── badge.ts         # BadgeData interface { id, name, age, title, imageUrl }
│   ├── globals.css          # Tailwind v4 import + CSS variables (light/dark)
│   ├── layout.tsx           # Root layout — Geist fonts, metadata
│   └── page.tsx             # Main page — badge state, Google Wallet fetch, renders form or cards
├── public/                  # Static assets
├── .env.local               # Real credentials — gitignored, never commit
├── .env.local.example       # Safe placeholder template for reference
├── next.config.ts           # Empty Next.js config
├── tsconfig.json            # Strict TS, path alias @/* → ./*
├── package.json
└── eslint.config.mjs
```

---

## Feature Roadmap

### Step 1 — Badge Form & Card Preview ✅ DONE

- Form collects: **name**, **age**, **title**, **profile image** (file upload → base64 data URL)
- UUID auto-generated on submit via `uuid` package (`v4`)
- **BadgeCard** — large ID card: gradient header, circular avatar, name, title, age, full UUID
- **BadgeMini** — small wallet badge: avatar + info row, QR code (encodes UUID), truncated ID
- State lives entirely in `page.tsx` — no DB, resets on "Create a new badge" click
- Images rendered with `next/image` + `unoptimized` prop (required for base64 data URLs)

### Step 2 — Google Wallet Integration ✅ DONE

- `app/api/google-wallet/route.ts` — `POST` handler, accepts `{ id, name, age, title }`
- Builds a **Generic Pass** payload (cardTitle=title, header=name, textModules for age+UUID, QR barcode)
- Signs a **JWT** (RS256) using the service account private key via Web Crypto API
- Returns `{ saveUrl: "https://pay.google.com/gp/v/save/<jwt>" }` — opened in new tab
- Button shows spinner + "Generating pass…" during request; shows error below card on failure

### Step 3 — Apple Wallet ⏭️ SKIPPED

Requires a paid Apple Developer account ($99/year). Not implemented.

---

## Key Design Decisions

- **No database** — state is in-memory / client-side only. Resets on page refresh. Intentional for demo.
- **App Router** — Next.js `app/` directory, not Pages Router.
- **API Routes** — live in `app/api/` as Route Handlers (`route.ts`).
- **Tailwind v4** — uses `@import "tailwindcss"` syntax (not old `@tailwind` directives). Class names changed: `bg-gradient-to-r` → `bg-linear-to-r`, `flex-shrink-0` → `shrink-0`.
- **Path alias** — `@/` maps to project root.
- **JWT signing** — done with Web Crypto API (`crypto.subtle`), no extra library needed beyond `google-auth-library` for auth validation.

---

## Environment Variables

Stored in `.env.local` (gitignored). Set these same values in Vercel dashboard for production.

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=      # client_email from service account JSON key
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY= # private_key from service account JSON key (with \n)
GOOGLE_WALLET_ISSUER_ID=3388000000023097542
GOOGLE_WALLET_CLASS_ID=3388000000023097542.badge_class
```

---

## Deployment — Vercel

**Deployed via Vercel (vercel.com). Steps to deploy / redeploy:**

1. Push code to GitHub (`.env.local` is gitignored — never pushed)
2. In Vercel dashboard → Project → **Settings → Environment Variables**
3. Add all 4 `GOOGLE_*` vars from `.env.local`
4. For `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: paste the full value including `-----BEGIN PRIVATE KEY-----` — Vercel handles the multi-line value safely
5. Every `git push` to main auto-deploys

**Important:** The `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` value contains literal `\n` in `.env.local`. In Vercel's env var UI, paste it exactly as-is — Vercel will preserve it correctly.

---

## Tech Stack

| Layer     | Tech                                                   |
| --------- | ------------------------------------------------------ |
| Framework | Next.js 16.1.6 (App Router)                            |
| Language  | TypeScript 5                                           |
| Styling   | Tailwind CSS v4 (via `@tailwindcss/postcss`)           |
| Fonts     | Geist Sans + Geist Mono (Google Fonts via `next/font`) |
| QR Code   | `react-qr-code` ^2.0.18 (already installed)            |
| UUID      | `uuid` ^13.0.0 + `@types/uuid` (already installed)     |
| React     | 19.2.3                                                 |

---

## Folder Structure (current)

```
badge-app/
├── app/
│   ├── api/
│   │   └── google-wallet/
│   │       └── route.ts    # POST — signs Google Wallet Generic Pass JWT, returns saveUrl
│   ├── components/
│   │   ├── BadgeCard.tsx    # Large ID card — gradient header, avatar, name, title, age, UUID
│   │   ├── BadgeForm.tsx    # Form — name, age, title, photo upload → generates UUID on submit
│   │   └── BadgeMini.tsx    # Small wallet badge — avatar, info, QR code, wallet buttons
│   ├── types/
│   │   └── badge.ts         # BadgeData interface { id, name, age, title, imageUrl }
│   ├── globals.css          # Tailwind v4 import + CSS variables (light/dark)
│   ├── layout.tsx           # Root layout — Geist fonts, metadata
│   └── page.tsx             # Main page — badge state, Google Wallet fetch, renders form or cards
├── public/                  # Static assets
├── .env.local.example       # Template for required env vars (never commit .env.local)
├── next.config.ts           # Empty Next.js config
├── tsconfig.json            # Strict TS, path alias @/* → ./*
├── package.json
└── eslint.config.mjs
```

---

## Planned Feature Roadmap (step-by-step)

### Step 1 — Badge Form & Card Preview ✅ DONE

- Form collects: **name**, **age**, **title**, **profile image** (file upload → base64 data URL)
- UUID auto-generated on submit via `uuid` package (`v4`)
- **BadgeCard** — large ID card: gradient header, circular avatar, name, title, age, full UUID
- **BadgeMini** — small wallet badge: avatar + info row, QR code (encodes UUID), truncated ID
- **Wallet buttons** on BadgeMini: "Add to Google Wallet" + "Add to Apple Wallet" (placeholders with alerts)
- State lives entirely in `page.tsx` — no DB, resets on "Create a new badge" click
- Images rendered with `next/image` + `unoptimized` prop (required for base64 data URLs)

### Step 2 — Google Wallet Integration ✅ DONE

- `app/api/google-wallet/route.ts` — `POST` handler, accepts `{ id, name, age, title }`
- Builds a **Generic Pass** payload (cardTitle=title, header=name, textModules for age+UUID, QR barcode)
- Signs a **JWT** (RS256) using the service account private key via Web Crypto API (no extra deps)
- Returns `{ saveUrl: "https://pay.google.com/gp/v/save/<jwt>" }` — opened in new tab
- Button shows spinner + "Generating pass…" during request; shows error message below card on failure
- Credentials read from env vars: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `GOOGLE_WALLET_ISSUER_ID`, `GOOGLE_WALLET_CLASS_ID`
- See `.env.local.example` for setup instructions

### Step 3 — Apple Wallet Integration

- Create a Next.js **API route** (`app/api/apple-wallet/route.ts`)
- Generate and sign a **`.pkpass`** file (zip bundle: `pass.json` + images + manifest + signature)
- Use `passkit-generator` npm package for Node.js
- User clicks "Add to Apple Wallet" → downloads `.pkpass` → iOS opens it in Wallet automatically

**Requirements:**

- Apple Developer account ($99/year)
- Pass Type ID certificate from Apple (`.p12` or `.pem`)
- `passkit-generator` npm package

**Key resource:** https://github.com/alexandercerutti/passkit-generator

---

## Key Design Decisions

- **No database** — all state is in-memory / client-side (React state). Nothing persists between page refreshes. This is intentional for the demo.
- **App Router** — using Next.js App Router (`app/` directory), not Pages Router.
- **API Routes** live in `app/api/` as Route Handlers (`route.ts` files).
- **Tailwind v4** — uses the new `@import "tailwindcss"` syntax, not the old `@tailwind base/components/utilities` directives.
- **Path alias** — `@/` maps to the project root (e.g. `@/app/components/...`).

---

## Packages to Install (when needed)

```bash
# Google Wallet
npm install google-auth-library

# Apple Wallet
npm install passkit-generator

# Image upload handling (if needed)
npm install react-dropzone
```

---

## Environment Variables (future — never commit keys)

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
GOOGLE_WALLET_ISSUER_ID=
GOOGLE_WALLET_CLASS_ID=

APPLE_PASS_TYPE_IDENTIFIER=
APPLE_TEAM_IDENTIFIER=
APPLE_CERT_PEM=
APPLE_KEY_PEM=
APPLE_WWDR_PEM=
```

---

## Next Immediate Step

**Step 3: Apple Wallet** — create `app/api/apple-wallet/route.ts`, generate and sign a `.pkpass` file.  
Install: `npm install passkit-generator`  
Needs: Apple Developer account ($99/yr) + Pass Type ID certificate (`.p12`) + Team Identifier
