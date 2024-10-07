-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_groupId_fkey";

-- DropForeignKey
ALTER TABLE "participants" DROP CONSTRAINT "participants_groupId_fkey";

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
