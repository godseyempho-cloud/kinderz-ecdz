import { prisma } from "@kinderz/db";

export default function Page() {
  console.log("Prisma loaded:", !!prisma);
  return <div>Hello</div>;
}
