/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "token_whitelist_refreshToken_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "refreshToken";
