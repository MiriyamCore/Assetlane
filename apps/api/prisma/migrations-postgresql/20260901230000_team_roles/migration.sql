-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('owner', 'admin', 'viewer');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'admin';

-- Promote the earliest account to owner when no owner exists yet.
UPDATE "User"
SET "role" = 'owner'
WHERE "id" = (
  SELECT "id" FROM "User" ORDER BY "createdAt" ASC LIMIT 1
)
AND NOT EXISTS (SELECT 1 FROM "User" WHERE "role" = 'owner');
