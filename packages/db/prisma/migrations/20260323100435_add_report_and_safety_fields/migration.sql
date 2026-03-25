/*
  Warnings:

  - You are about to drop the column `createdAt` on the `MonthlyReport` table. All the data in the column will be lost.
  - You are about to drop the column `foodDepCalc` on the `MonthlyReport` table. All the data in the column will be lost.
  - You are about to drop the column `overheadsDepCalc` on the `MonthlyReport` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedAt` on the `MonthlyReport` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedById` on the `MonthlyReport` table. All the data in the column will be lost.
  - You are about to drop the column `salariesDepCalc` on the `MonthlyReport` table. All the data in the column will be lost.
  - You are about to drop the column `signatureUrl` on the `MonthlyReport` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `MonthlyReport` table. All the data in the column will be lost.
  - You are about to drop the column `isLate` on the `QuarterlyReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "disability" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "disabilityType" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "race" TEXT;

-- AlterTable
ALTER TABLE "MonthlyReport" DROP COLUMN "createdAt",
DROP COLUMN "foodDepCalc",
DROP COLUMN "overheadsDepCalc",
DROP COLUMN "reviewedAt",
DROP COLUMN "reviewedById",
DROP COLUMN "salariesDepCalc",
DROP COLUMN "signatureUrl",
DROP COLUMN "updatedAt",
ADD COLUMN     "days" INTEGER NOT NULL DEFAULT 22,
ADD COLUMN     "foodVariance" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "overheadsVariance" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "salariesVariance" DECIMAL(65,30) DEFAULT 0;

-- AlterTable
ALTER TABLE "QuarterlyReport" DROP COLUMN "isLate";

-- CreateTable
CREATE TABLE "SafetyAudit" (
    "id" TEXT NOT NULL,
    "ecdCenterId" TEXT NOT NULL,
    "auditorId" TEXT NOT NULL,
    "auditDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fireSafety" BOOLEAN NOT NULL DEFAULT false,
    "cleanWater" BOOLEAN NOT NULL DEFAULT false,
    "secureFencing" BOOLEAN NOT NULL DEFAULT false,
    "firstAidKit" BOOLEAN NOT NULL DEFAULT false,
    "comments" TEXT,
    "status" "FindingStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "SafetyAudit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SafetyAudit" ADD CONSTRAINT "SafetyAudit_ecdCenterId_fkey" FOREIGN KEY ("ecdCenterId") REFERENCES "EcdCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyAudit" ADD CONSTRAINT "SafetyAudit_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
