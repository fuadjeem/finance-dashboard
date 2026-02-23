-- Add currency column to User table
-- Run with: npx wrangler d1 execute finance-dashboard-db --remote --file=prisma/migrations/003_add_currency.sql

ALTER TABLE "User" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';
