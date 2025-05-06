/*
  Warnings:

  - You are about to drop the column `description` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `managerId` on the `User` table. All the data in the column will be lost.
  - Added the required column `pin` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_managerId_fkey";

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "managerId",
ADD COLUMN     "pin" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "KioskAuthLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "method" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "attemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,
    "message" TEXT,

    CONSTRAINT "KioskAuthLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KioskAuthLog" ADD CONSTRAINT "KioskAuthLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
