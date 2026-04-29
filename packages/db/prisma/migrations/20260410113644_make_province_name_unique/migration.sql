/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Province` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'ECD_USER';

-- CreateIndex
CREATE UNIQUE INDEX "Province_name_key" ON "Province"("name");
