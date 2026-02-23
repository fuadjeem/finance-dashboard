-- Add excluded column to Transaction table and remove active from Category
-- Run with: npx wrangler d1 execute finance-dashboard-db --remote --file=prisma/migrations/004_add_excluded.sql

ALTER TABLE "Transaction" ADD COLUMN "excluded" INTEGER NOT NULL DEFAULT 0;
