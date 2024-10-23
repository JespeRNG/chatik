/*
  Warnings:

  - Added the required column `expiresAt` to the `token_whitelist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "token_whitelist" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;
