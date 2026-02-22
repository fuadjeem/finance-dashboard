# FinanceFlow — Personal Finance Dashboard

A beautiful, full-stack personal finance dashboard built with Next.js, Prisma (SQLite), and NextAuth.

## Features

- 📊 **Dashboard** — Bar chart (income vs costs), analytics cards, recent costs table
- 💳 **Transactions** — Add, edit, delete with search & filters
- ⚙️ **Settings** — Manage cost & income categories (add, rename, deactivate)
- 🔐 **Auth** — Secure signup/login with bcrypt password hashing
- 📥 **CSV Export** — Download all transactions as CSV
- 📱 **Responsive** — Works on desktop and mobile

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React, Recharts
- **Backend:** Next.js API Routes
- **Database:** SQLite via Prisma ORM
- **Auth:** NextAuth.js v4 (Credentials provider, JWT sessions)
- **Styling:** Vanilla CSS (dark mode, glassmorphism)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd finance-dashboard

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env and set a random NEXTAUTH_SECRET

# 4. Run database migration
npx prisma migrate dev

# 5. Generate Prisma Client
npx prisma generate

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite connection string (`file:./dev.db`) |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |
| `NEXTAUTH_URL` | Your app URL (`http://localhost:3000`) |

> ⚠️ **Never commit `.env` to git.** Use `.env.example` as a template.

## Project Structure

```
finance-dashboard/
├── prisma/
│   ├── schema.prisma       # Database models
│   └── migrations/         # Migration files
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # NextAuth + signup
│   │   │   ├── categories/ # CRUD
│   │   │   ├── transactions/ # CRUD + summary
│   │   │   └── export/     # CSV export
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   └── (app)/          # Authenticated routes
│   │       ├── dashboard/  # Charts + analytics
│   │       ├── transactions/ # Full transaction list
│   │       └── settings/   # Category management
│   ├── components/         # Reusable components
│   └── lib/                # Prisma client, auth config
├── .env.example            # Environment template
└── README.md
```

## Privacy

- SQLite database file (`*.db`) is in `.gitignore`
- `.env` is in `.gitignore`
- No real data or secrets in the repo
- All user data is isolated by `userId`

## License

MIT
