import { prisma } from "@kinderz/db";
import bcrypt from "bcryptjs";

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      password: await bcrypt.hash("test1234", 10),
      name: "Test User",
      role: "ECD_USER",
      isActive: true,
    },
  });

  console.log("✅ Test user created:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
