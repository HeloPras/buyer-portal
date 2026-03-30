# Buyer Portal

A full-stack Next.js application for a real-estate buyer portal. Users can register, log in, browse seeded properties, and save/remove favourites — all scoped securely to their own account.

---

## Tech stack

- **Next.js 14** (App Router) — pages and API route handlers in one project
- **Prisma + SQLite** — lightweight DB, zero setup required
- **bcryptjs** — password hashing (never stored in plaintext)
- **jose** — JWT signing and verification
- **TypeScript** throughout

---

## Project structure

```
buyer-portal/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts   # POST — create account
│   │   │   ├── login/route.ts      # POST — sign in, set cookie
│   │   │   └── logout/route.ts     # POST — clear cookie
│   │   ├── favourites/
│   │   │   ├── route.ts            # GET all / POST add
│   │   │   └── [propertyId]/route.ts  # DELETE remove
│   │   └── properties/route.ts     # GET all properties
│   ├── dashboard/
│   │   ├── page.tsx                # Server component — fetches session + data
│   │   ├── DashboardClient.tsx     # Client component — interactive UI
│   │   └── dashboard.module.css
│   ├── login/
│   │   ├── page.tsx
│   │   └── auth.module.css
│   ├── register/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx                    # Redirects → /dashboard or /login
│   └── globals.css
├── lib/
│   ├── auth.ts                     # JWT helpers + getSession()
│   └── prisma.ts                   # Prisma singleton client
├── middleware.ts                   # Protects /dashboard and /api/favourites
├── prisma/
│   ├── schema.prisma               # User, Property, Favourite models
│   └── seed.ts                     # 6 seeded properties
└── .env.example
```

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

Create a `.env` file.

Edit `.env` and set a strong `JWT_SECRET` (any long random string works for local dev).

### 3. Set up the database and seed properties

```bash
npm run setup
```

This runs `prisma generate` + `prisma db push` + the seed script in one command. A `prisma/dev.db` SQLite file will be created with 6 properties already in it.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Example flows

### Sign up → browse → save a property

1. Visit `/register`
2. Enter your name, email, and a password (min 8 chars)
3. You land on `/dashboard` — all 6 properties are listed
4. Click the heart icon or "Save" button on any property card
5. Switch to "My favourites" in the sidebar to see your saved list

### Log out → log back in

1. Click "Sign out" in the sidebar
2. You're redirected to `/login`
3. Enter your credentials — the cookie is restored and you land back on `/dashboard`
4. Your favourites are exactly as you left them

### Ownership enforcement

Every favourites request reads `userId` from the verified JWT cookie — never from the request body. A user cannot view or modify another user's favourites even if they craft a manual API request.

---

## Auth design notes

- Passwords are hashed with **bcrypt at cost factor 12** before being stored
- The JWT is stored in an **httpOnly cookie** — inaccessible to JavaScript (XSS-safe)
- Login returns the same error message for "user not found" and "wrong password" to prevent user enumeration
- `middleware.ts` protects `/dashboard` and `/api/favourites` routes — public routes (`/login`, `/register`, `/api/auth/*`) are explicitly excluded from the matcher
- The `Favourite` table has a **unique constraint on `[userId, propertyId]`** preventing duplicate saves

---

