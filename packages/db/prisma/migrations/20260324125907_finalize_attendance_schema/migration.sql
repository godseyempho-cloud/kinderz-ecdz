/*
  Warnings:

  - You are about to drop the column `present` on the `Attendance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[birthCertificateNumber]` on the table `Child` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ecdCenterId` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `markedById` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_reportId_fkey";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "present",
ADD COLUMN     "ecdCenterId" TEXT NOT NULL,
ADD COLUMN     "markedById" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PRESENT',
ALTER COLUMN "date" SET DATA TYPE DATE,
ALTER COLUMN "reportId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "birthCertificateNumber" TEXT,
ALTER COLUMN "funded" SET DEFAULT false;

-- CreateIndex
CREATE INDEX "Attendance_ecdCenterId_date_idx" ON "Attendance"("ecdCenterId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Child_birthCertificateNumber_key" ON "Child"("birthCertificateNumber");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_ecdCenterId_fkey" FOREIGN KEY ("ecdCenterId") REFERENCES "EcdCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_ecdCenterId_fkey" FOREIGN KEY ("ecdCenterId") REFERENCES "EcdCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "QuarterlyReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
