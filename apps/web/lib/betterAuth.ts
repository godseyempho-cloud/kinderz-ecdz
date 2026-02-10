import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@kinderz/db";

// PrismaConfig — database type
const config = {
  provider: "postgresql" as const,
};

export const auth = betterAuth({
  adapter: prismaAdapter(prisma, config),
  secret: process.env.BETTER_AUTH_SECRET!,
});
