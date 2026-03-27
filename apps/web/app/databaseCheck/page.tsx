import { prisma } from "@kinderz/db";

export default async function Page() {
  // Minimal test: count users table or any model
  let count = 0;
  try {
    count = await prisma.user.count();
    console.log("User count:", count);
  } catch (err) {
    console.error("Prisma DB connection error:", err);
  }

  return <div>Hello — Users in DB: {count}</div>;
}
