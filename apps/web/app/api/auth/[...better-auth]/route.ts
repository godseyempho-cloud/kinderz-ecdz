import { auth } from "@/lib/betterAuth";

/**
 * Handles all GET requests for authentication
 */
export async function GET(req: Request) {
  return auth.handler(req);
}

/**
 * Handles all POST requests for authentication
 */
export async function POST(req: Request) {
  return auth.handler(req);
}
