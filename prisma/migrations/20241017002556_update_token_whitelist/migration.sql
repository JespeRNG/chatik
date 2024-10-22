/*
  Warnings:

  - You are about to drop the `TokenWhiteList` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "TokenWhiteList";

-- CreateTable
CREATE TABLE "token_whitelist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "deviceInfo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_whitelist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_whitelist_refreshToken_key" ON "token_whitelist"("refreshToken");
