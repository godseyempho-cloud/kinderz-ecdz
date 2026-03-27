/*
  Warnings:

  - The values [PENDING,APPROVED,FLAGGED] on the enum `FindingStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `compliant` on the `AuditFinding` table. All the data in the column will be lost.
  - Added the required column `content` to the `AuditFinding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `AuditFinding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MonthlyReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FindingStatus_new" AS ENUM ('OPEN', 'CORRECTIONS_REQUIRED', 'RESOLVED_BY_SUPERVISOR', 'RESOLVED', 'DISPUTED');
ALTER TABLE "AuditFinding" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SafetyAudit" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SafetyAudit" ALTER COLUMN "status" TYPE "FindingStatus_new" USING ("status"::text::"FindingStatus_new");
ALTER TABLE "AuditFinding" ALTER COLUMN "status" TYPE "FindingStatus_new" USING ("status"::text::"FindingStatus_new");
ALTER TYPE "FindingStatus" RENAME TO "FindingStatus_old";
ALTER TYPE "FindingStatus_new" RENAME TO "FindingStatus";
DROP TYPE "FindingStatus_old";
ALTER TABLE "AuditFinding" ALTER COLUMN "status" SET DEFAULT 'OPEN';
ALTER TABLE "SafetyAudit" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterEnum
ALTER TYPE "SubmissionStatus" ADD VALUE 'REVISION_REQUIRED';

-- DropForeignKey
ALTER TABLE "AuditFinding" DROP CONSTRAINT "AuditFinding_reportId_fkey";

-- DropIndex
DROP INDEX "AuditFinding_reportId_key";

-- AlterTable
ALTER TABLE "AuditFinding" DROP COLUMN "compliant",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "MonthlyReport" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "QuarterlyReport" ADD COLUMN     "auditFindingId" TEXT;

-- AlterTable
ALTER TABLE "SafetyAudit" ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- AddForeignKey
ALTER TABLE "QuarterlyReport" ADD CONSTRAINT "QuarterlyReport_auditFindingId_fkey" FOREIGN KEY ("auditFindingId") REFERENCES "AuditFinding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditFinding" ADD CONSTRAINT "AuditFinding_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MonthlyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
