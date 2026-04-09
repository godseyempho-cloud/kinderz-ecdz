/*
  Warnings:

  - A unique constraint covering the columns `[districtId,role]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ecdCenterId,role]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "MonthlyReport" DROP CONSTRAINT "MonthlyReport_submittedById_fkey";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- CreateIndex
CREATE UNIQUE INDEX "user_districtId_role_key" ON "user"("districtId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "user_ecdCenterId_role_key" ON "user"("ecdCenterId", "role");

-- AddForeignKey
ALTER TABLE "MonthlyReport" ADD CONSTRAINT "MonthlyReport_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
