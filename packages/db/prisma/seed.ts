// packages/db/prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs' // Ensure you have bcryptjs installed in your db package

const prisma = new PrismaClient()

async function main() {
  const adminEmail = "admin@tinyiko.co.za" // Change this to your preferred admin email
  const hashedPassword = await hash("AdminPassword123!", 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "System Admin",
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },
  })

  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })