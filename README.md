# kavya_labs
project for wb dev
# Kavya Labs — AI Infrastructure

A modern, responsive landing page for Kavya Labs built as part of the 3-week developer brief.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Language:** TypeScript

## Week 1 Deliverables
- [x] Navbar with brand identity and call-to-action
- [x] Hero section with clean typography and badges
- [x] Features grid highlighting core AI capabilities
- [x] Responsive footer with quick links

## Getting Started
```bash
npm install
npm run dev
```

## Authentication
Email + password accounts with signed, HTTP-only session cookies.

### Setup
```bash
cp .env.example .env.local
# set AUTH_SECRET to a random string of 32+ characters, e.g.:
openssl rand -base64 48
```

### Routes
| Route        | Access        | Notes                                           |
| ------------ | ------------- | ----------------------------------------------- |
| `/signup`    | public        | Creates an account and signs you in             |
| `/login`     | public        | Redirects to `/dashboard` if already signed in  |
| `/dashboard` | signed-in     | Redirects to `/login?next=...` when signed out  |

### How it works
- Passwords are hashed with bcrypt (cost 12); sessions are HS256 JWTs in an `httpOnly`, `sameSite=lax` cookie (`secure` in production), valid for 7 days.
- `src/middleware.ts` gates `/dashboard`; pages and server actions re-check with `requireUser()`, which reloads the user so deleted accounts stop working immediately.
- Login and signup are rate limited (in memory, per process).
- Users are stored in `.data/users.json` (git-ignored). The store lives behind `src/lib/users.ts`; swap it for a real database before running more than one server instance or deploying to a serverless platform.
