/*
  Warnings:

  - A unique constraint covering the columns `[refreshToken]` on the table `token_whitelist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "token_whitelist_refreshToken_key" ON "token_whitelist"("refreshToken");
