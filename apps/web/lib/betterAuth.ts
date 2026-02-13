// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "@kinderz/db";
// import bcrypt from "bcryptjs";

// // PrismaConfig — database type
// const config = {
//   provider: "postgresql" as const,
// };

// export const auth = betterAuth({
//   // Connect to Prisma
//   adapter: prismaAdapter(prisma, config),

//   // Secret for signing cookies
//   secret: process.env.BETTER_AUTH_SECRET!,

//   // Credentials provider (email/password)
//   credentials: {
//     async authorize(
//       credentials: { email: string; password: string } // <- type added
//     ) {
//       const { email, password } = credentials;

//       // Find user by email
//       const user = await prisma.user.findUnique({
//         where: { email },
//       });

//       // Reject if no user or no password stored
//       if (!user || !user.password) return null;

//       // Check password
//       const isValid = await bcrypt.compare(password, user.password);
//       if (!isValid) return null;

//       // Return user for session
//       return {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//       };
//     },
//   },
  
// });



// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "@kinderz/db";
// import bcrypt from "bcryptjs";

// // REQUIRED by your adapter version
// const config = {
//   provider: "postgresql" as const,
// };

// export const auth = betterAuth({
//   // Prisma adapter (must include config)
//   adapter: prismaAdapter(prisma, config),

//   // Secret for cookies & tokens
//   secret: process.env.BETTER_AUTH_SECRET!,

//   // Credentials: Email + Password
//   credentials: {
//     async authorize(credentials: { email?: string; password?: string }) {
//       if (!credentials?.email || !credentials?.password) {
//         return null;
//       }

//       const user = await prisma.user.findUnique({
//         where: { email: credentials.email },
//       });

//       if (!user || !user.password) return null;

//       const isValid = await bcrypt.compare(
//         credentials.password,
//         user.password
//       );

//       if (!isValid) return null;

//       return {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//       };
//     },
//   },
// });



import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@kinderz/db";

// REQUIRED by your adapter version
const config = {
  provider: "postgresql" as const,
};

export const auth = betterAuth({
  // Prisma adapter (must include config)
  database: prismaAdapter(prisma, config),

  // Secret for cookies & tokens
  secret: process.env.BETTER_AUTH_SECRET!,

  // This is the specific block that fixes your "not enabled" error
  emailAndPassword: {
    enabled: true,
  },
  
  // If you need the 'role' or other custom fields in the session
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "ECD_USER",
      },
    },
  },
});










