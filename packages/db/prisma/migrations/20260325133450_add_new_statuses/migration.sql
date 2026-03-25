/*
  Warnings:

  - The `comments` column on the `AuditFinding` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
ALTER TYPE "FindingStatus" ADD VALUE 'RESOLVED_BY_SUPERVISOR';

-- AlterEnum
ALTER TYPE "SubmissionStatus" ADD VALUE 'SUBMITTED_TO_PROVINCE';

-- AlterTable
ALTER TABLE "AuditFinding" DROP COLUMN "comments",
ADD COLUMN     "comments" TEXT[];
