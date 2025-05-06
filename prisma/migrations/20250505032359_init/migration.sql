/*
  Warnings:

  - You are about to drop the column `createdAt` on the `TimeRecord` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TimeRecord` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `TimeRecord` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TimeRecord" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';
