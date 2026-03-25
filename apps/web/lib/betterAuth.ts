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



// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "@kinderz/db";


// // REQUIRED by your adapter version
// const config = {
//   provider: "postgresql" as const,
// };

// export const auth = betterAuth({
//   // Prisma adapter (must include config)
//   database: prismaAdapter(prisma, config),

//   // Secret for cookies & tokens
//   secret: process.env.BETTER_AUTH_SECRET!,

//   // This is the specific block that fixes your "not enabled" error
//   emailAndPassword: {
//     enabled: true,
//   },
  
//   // If you need the 'role' or other custom fields in the session
//   user: {
//     additionalFields: {
//       role: {
//         type: "string",
//         required: false,
//         defaultValue: "ECD_USER",
//       },
//     },
//   },
// });



// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "@kinderz/db"; // Complying with your workspace import
// import { admin } from "better-auth/plugins";

// // REQUIRED by your adapter version for PostgreSQL
// const adapterConfig = {
//   provider: "postgresql" as const,
// };

// export const auth = betterAuth({
//   // 1. Database Setup
//   database: prismaAdapter(prisma, adapterConfig),

//   // 2. Security
//   secret: process.env.BETTER_AUTH_SECRET!,

// // This is the "Nuclear Option" for Codespaces development.
//   // It tells Better Auth: "Don't block requests based on the URL origin."
//   advanced: {
//     disableCheckOrigin: true, 
//   },


//   // FIX: Explicitly allow both the Codespace URL AND localhost
//   trustedOrigins: [
//     "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev"
//   ],



//   // 3. Phase 1: Credentials (Email & Password)
//   emailAndPassword: {
//     enabled: true,
//     // Fix: Explicitly type the authorize arguments to avoid the 'any' error
//     async authorize({ email, password }: { email: string; password: string }) {
//       // 1. Find user in the Prisma DB
//       const user = await prisma.user.findUnique({
//         where: { email },
//       });

//       // 2. Simple password check (Note: Better Auth handles hashing, 
//       // but this is the manual hook if you need it)
//       if (!user || user.password !== password) {
//         return null; // Signals unauthorized
//       }

//       return user; // Returns user to create the session
//     },
//   },

//   // 4. Customizing the Session & User shape
//   user: {
//     additionalFields: {
//       role: {
//         type: "string",
//         required: false,
//         defaultValue: "ECD_USER", // Ensures new signups get this role
//       },
//     },
//   },

//   // 5. Plugins (Prepares for Phase 3 Role Guards)
//   plugins: [
//     admin(), // Enables role-based logic server-side
//   ],
// });




// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "@kinderz/db"; 
// import { admin } from "better-auth/plugins";
// import { nextCookies } from "better-auth/next-js";

// // REQUIRED by your adapter version for PostgreSQL
// const adapterConfig = {
//   provider: "postgresql" as const,
// };

// export const auth = betterAuth({
//   // 1. Database Setup
//   database: prismaAdapter(prisma, adapterConfig),

//   baseURL: "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",

//   // 2. Security & Origin Configuration
//   secret: process.env.BETTER_AUTH_SECRET!,

//   // In 1.4.7, we use trustedOrigins + useSecureCookies to bypass the origin block in Codespaces
//   advanced: {
//     // 1. Tell Better Auth it is behind a proxy (Codespaces)
//     useSecureCookies: true, 
//     // 2. This is the "Magic" setting for 1.4.7 to trust proxy headers
//     trustHost: true, 
//   },

//   // This tells the server exactly which URLs to trust
//   trustedOrigins: [
//     "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",
//     "https://localhost:3000",
//     "http://localhost:3000"
//   ],

//   // 3. Phase 1: Credentials (Email & Password)
//   // Logic: In 1.4.7, 'enabled: true' handles the findUnique and password check automatically.
//   emailAndPassword: {
//     enabled: true,
//     requireEmailVerification: false, // Set to true once you reach Phase 2
//   },

//   // 4. Customizing the Session & User shape
//   user: {
//           // 1. This "fields" block tells Better Auth: "Don't send 'banned' to Prisma"
      
//     additionalFields: {
//       role: {
//         type: "string",
//         required: false,
//         defaultValue: "ECD_USER", 
//         input: false, // This prevents the client from accidentally sending "user"
//       },
//     },
//   },

//   // 5. Plugins
//   plugins: [
//     admin({
//       // This is the secret fix: Tell the admin plugin NOT to 
//       // use the default "user" string.
//       defaultRole: "ECD_USER", 
//     }), // Enables role-based logic
//     nextCookies(), // Essential for Next.js App Router cookie handling
//   ],
  
// });


import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@kinderz/db"; 
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

// REQUIRED by your adapter version for PostgreSQL
const adapterConfig = {
  provider: "postgresql" as const,
};

export const auth = betterAuth({
  // 1. Database Setup
  database: prismaAdapter(prisma, adapterConfig),

  // Your specific Codespace URL
  baseURL: "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",

  // 2. Security & Origin Configuration (Essential for Codespaces)
  secret: process.env.BETTER_AUTH_SECRET!,

  advanced: {
    useSecureCookies: true, // Forces cookies to work over the HTTPS proxy
    trustHost: true,       // Trusts headers provided by the GitHub Proxy
  },

  trustedOrigins: [
    "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",
    "https://localhost:3000",
    "http://localhost:3000"
  ],

  // 3. Email/Password Auth
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, 
  },

  // 4. Customizing the Session & User shape
  // I added ecdCenterId here so the Attendance UI knows which kids to load.
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "ECD_USER", 
        input: false,
      },
      // ADDED: These link the user to the hierarchy in your schema
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

  // 5. Plugins
  plugins: [
    admin({
      defaultRole: "ECD_USER", 
    }), 
    nextCookies(), // Critical for Next.js 15+ App Router
  ],
});