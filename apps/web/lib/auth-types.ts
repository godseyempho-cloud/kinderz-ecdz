// apps/web/lib/auth-types.ts
import { auth } from "./betterAuth"; 

export type Session = typeof auth.$Infer.Session;
// In 1.x, the User type is accessed via Session["user"]
export type User = typeof auth.$Infer.Session["user"];