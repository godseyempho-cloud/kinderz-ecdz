/*
  Warnings:

  - You are about to drop the column `district` on the `EcdCenter` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `EcdCenter` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Verification` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `districtId` to the `EcdCenter` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CenterFundingStatus" AS ENUM ('APPROVED', 'DISCONTINUED', 'DISAPPROVED');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('PENDING', 'APPROVED', 'FLAGGED', 'CORRECTIONS_REQUIRED');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "EcdCenter" DROP CONSTRAINT "EcdCenter_supervisorId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentProof" DROP CONSTRAINT "PaymentProof_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "PaymentProof" DROP CONSTRAINT "PaymentProof_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "QuarterlyReport" DROP CONSTRAINT "QuarterlyReport_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "Verification" DROP CONSTRAINT "Verification_userId_fkey";

-- DropIndex
DROP INDEX "EcdCenter_district_idx";

-- DropIndex
DROP INDEX "EcdCenter_province_idx";

-- AlterTable
ALTER TABLE "AuditFinding" ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "status" "FindingStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "monthlyReportId" TEXT;

-- AlterTable
ALTER TABLE "EcdCenter" DROP COLUMN "district",
DROP COLUMN "province",
ADD COLUMN     "basNumber" TEXT,
ADD COLUMN     "districtId" TEXT NOT NULL,
ADD COLUMN     "fundingStatus" "CenterFundingStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "registrationExpiryDate" TIMESTAMP(3),
ADD COLUMN     "registrationLevel" TEXT;

-- AlterTable
ALTER TABLE "PaymentProof" ADD COLUMN     "comment" TEXT;

-- AlterTable
ALTER TABLE "QuarterlyReport" ADD COLUMN     "achievements" TEXT,
ADD COLUMN     "challenges" TEXT,
ADD COLUMN     "is80PercentAttend" BOOLEAN,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "programmeName" TEXT,
ADD COLUMN     "totalExpenses" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "totalIncome" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Verification";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ECD_USER',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ecdCenterId" TEXT,
    "districtId" TEXT,
    "provinceId" TEXT,
    "assignedById" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Province" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provinceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "password" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "userId" TEXT,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyReport" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "ecdCenterId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "allocation" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalExpenditure" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "salariesExpense" DECIMAL(65,30) DEFAULT 0,
    "foodExpense" DECIMAL(65,30) DEFAULT 0,
    "overheadsExpense" DECIMAL(65,30) DEFAULT 0,
    "otherExpense" DECIMAL(65,30) DEFAULT 0,
    "salariesDepCalc" DECIMAL(65,30) DEFAULT 0,
    "foodDepCalc" DECIMAL(65,30) DEFAULT 0,
    "overheadsDepCalc" DECIMAL(65,30) DEFAULT 0,
    "attendanceCount" INTEGER,
    "childrenFunded" INTEGER,
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "signatureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "MonthlyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyAllocation" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcdCenterFunding" (
    "id" TEXT NOT NULL,
    "ecdCenterId" TEXT NOT NULL,
    "basNumber" TEXT,
    "registrationLevel" TEXT,
    "registrationExpiry" TIMESTAMP(3),
    "budgetPerAnnum" DECIMAL(65,30),
    "budgetPerQuarter" DECIMAL(65,30),
    "q1Actual" DECIMAL(65,30) DEFAULT 0,
    "q2Actual" DECIMAL(65,30) DEFAULT 0,
    "q3Actual" DECIMAL(65,30) DEFAULT 0,
    "q4Actual" DECIMAL(65,30) DEFAULT 0,
    "balance" DECIMAL(65,30) DEFAULT 0,
    "fundingStatus" "CenterFundingStatus" NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcdCenterFunding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "provinceId" TEXT,
    "ecdCenterId" TEXT,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- CreateIndex
CREATE INDEX "user_ecdCenterId_idx" ON "user"("ecdCenterId");

-- CreateIndex
CREATE INDEX "user_districtId_idx" ON "user"("districtId");

-- CreateIndex
CREATE INDEX "user_provinceId_idx" ON "user"("provinceId");

-- CreateIndex
CREATE UNIQUE INDEX "user_provinceId_role_key" ON "user"("provinceId", "role");

-- CreateIndex
CREATE INDEX "Province_name_idx" ON "Province"("name");

-- CreateIndex
CREATE INDEX "District_provinceId_idx" ON "District"("provinceId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "session_token_idx" ON "session"("token");

-- CreateIndex
CREATE INDEX "MonthlyReport_ecdCenterId_idx" ON "MonthlyReport"("ecdCenterId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyReport_ecdCenterId_year_month_key" ON "MonthlyReport"("ecdCenterId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "EcdCenterFunding_ecdCenterId_key" ON "EcdCenterFunding"("ecdCenterId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE INDEX "EcdCenter_districtId_idx" ON "EcdCenter"("districtId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcdCenter" ADD CONSTRAINT "EcdCenter_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcdCenter" ADD CONSTRAINT "EcdCenter_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification" ADD CONSTRAINT "verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuarterlyReport" ADD CONSTRAINT "QuarterlyReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_monthlyReportId_fkey" FOREIGN KEY ("monthlyReportId") REFERENCES "MonthlyReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditFinding" ADD CONSTRAINT "AuditFinding_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyReport" ADD CONSTRAINT "MonthlyReport_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyReport" ADD CONSTRAINT "MonthlyReport_ecdCenterId_fkey" FOREIGN KEY ("ecdCenterId") REFERENCES "EcdCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyAllocation" ADD CONSTRAINT "MonthlyAllocation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MonthlyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcdCenterFunding" ADD CONSTRAINT "EcdCenterFunding_ecdCenterId_fkey" FOREIGN KEY ("ecdCenterId") REFERENCES "EcdCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
