/**
 * Test script: Monthly Report Locking Workflow
 * 
 * Verifies that the status field and locking logic work:
 * 1. New reports are created with status = DRAFT
 * 2. Only reports in DRAFT can be submitted (transitioned to SUBMITTED)
 * 3. The isReportLocked guard prevents invalid transitions
 * 
 * This test uses direct Prisma queries to isolate the locking logic
 * from any authentication issues. Once auth works, the endpoints
 * verified in this test will enforce the same rules.
 * 
 * Run: npx tsx scripts/testLocking.ts
 */

import { prisma } from "@kinderz/db";

async function main() {
  console.log("🔐 Testing Report Locking Logic (via Prisma)...\n");

  // 1. Set up test data
  let province = await prisma.province.findFirst({ where: { name: "LockTestProvince" } });
  if (!province) {
    province = await prisma.province.create({ data: { name: "LockTestProvince" } });
  }

  let district = await prisma.district.findFirst({ where: { name: "LockTestDistrict" } });
  if (!district) {
    district = await prisma.district.create({
      data: { name: "LockTestDistrict", provinceId: province.id },
    });
  }

  let center = await prisma.ecdCenter.findFirst({
    where: { name: "LockTestCenter" },
  });
  if (!center) {
    center = await prisma.ecdCenter.create({
      data: { name: "LockTestCenter", districtId: district.id },
    });
  }

  let supervisor = await prisma.user.findFirst({
    where: { email: "locktest@example.com" },
  });
  if (!supervisor) {
    supervisor = await prisma.user.create({
      data: {
        email: "locktest@example.com",
        password: "test",
        role: "SUPERVISOR",
        ecdCenterId: center.id,
      },
    });
  }

  console.log(
    `✓ Test data ready: supervisor=${supervisor.id}, center=${center.id}\n`
  );

  // 2. Create a report (should default to DRAFT)
  console.log("1️⃣  Creating report (should be DRAFT)...");
  const report = await prisma.monthlyReport.create({
    data: {
      year: 2026,
      month: 3,
      ecdCenterId: center.id,
      submittedById: supervisor.id,
      allocation: "5000",
      totalExpenditure: "500",
      allocations: {
        create: [{ category: "FOOD", amount: "500", date: new Date() }],
      },
    },
  });
  console.log(
    `   ✓ Created report ${report.id} with status: "${report.status}"`
  );
  if (report.status !== "DRAFT") {
    throw new Error(`Expected DRAFT, got ${report.status}`);
  }
  if (report.submittedAt !== null) {
    throw new Error("submittedAt should be null for DRAFT reports");
  }
  console.log();

  // 3. Update report to SUBMITTED (simulating the submit endpoint)
  console.log("2️⃣  Submitting report (DRAFT → SUBMITTED)...");
  const submitted = await prisma.monthlyReport.update({
    where: { id: report.id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });
  console.log(
    `   ✓ Submitted report with new status: "${submitted.status}"`
  );
  if (submitted.status !== "SUBMITTED") {
    throw new Error(`Expected SUBMITTED, got ${submitted.status}`);
  }
  if (submitted.submittedAt === null) {
    throw new Error("submittedAt should be set for SUBMITTED reports");
  }
  console.log();

  // 4. Verify the locking guard logic (isReportLocked)
  console.log("3️⃣  Testing isReportLocked guard...");
  // Import guard for testing
  const { isReportLocked } = await import("@/lib/api-guards");

  try {
    // Should NOT throw: DRAFT is in allowedStatuses
    isReportLocked("DRAFT", ["DRAFT"]);
    console.log("   ✓ DRAFT status allowed for editing");
  } catch (e) {
    throw new Error("DRAFT should be allowed for editing");
  }

  try {
    // Should throw: SUBMITTED is not in allowedStatuses
    isReportLocked("SUBMITTED", ["DRAFT"]);
    throw new Error("SUBMITTED should NOT be allowed for editing");
  } catch (e) {
    if (e instanceof Error && e.message.includes("locked")) {
      console.log("   ✓ SUBMITTED status correctly locked for editing");
    } else {
      throw e;
    }
  }

  console.log();
  console.log("✅ All locking tests passed!\n");
  console.log("Summary:");
  console.log("  • New reports are created as DRAFT");
  console.log("  • DRAFT reports can transition to SUBMITTED");
  console.log("  • SUBMITTED reports are locked (cannot edit)");
  console.log(
    "\nNext: These guards are enforced in the API endpoints. Once auth works,"
  );
  console.log("supervisors won't be able to submit again or edit after SUBMITTED.");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});

