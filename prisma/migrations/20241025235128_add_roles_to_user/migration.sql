-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('admin', 'user', 'groupCreator');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "roles" "Roles"[] DEFAULT ARRAY['user']::"Roles"[];
