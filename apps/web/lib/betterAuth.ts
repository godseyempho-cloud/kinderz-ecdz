import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@kinderz/db"; 
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { hash, compare } from "bcryptjs";

const adapterConfig = {
  provider: "postgresql" as const,     
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, adapterConfig),

  baseURL: "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",

  secret: process.env.BETTER_AUTH_SECRET!,

  advanced: {
    useSecureCookies: true, 
    trustHost: true,       
  },

  trustedOrigins: [
    "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",
    "https://localhost:3000",
    "http://localhost:3000"
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      hash: async (password: string) => {
        return await hash(password, 12);
      },
      verify: async ({ password, hash }: { password: string, hash: string }) => {
        return await compare(password, hash);
      },
    },
  },

  user: {
    additionalFields: {
      // ADDED: provinceId to resolve TS errors in layout/pages
      provinceId: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "ECD_USER", 
        input: false,
      },
      ecdCenterId: {
        type: "string",
        required: false,
      },
      districtId: {
        type: "string",
        required: false,
      }
    },
  },

  plugins: [
    admin({
      defaultRole: "ECD_USER", 
    }), 
    nextCookies(), 
  ],
});