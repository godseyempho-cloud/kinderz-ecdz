// import { auth } from "@/lib/betterAuth";

// /**
//  * Handles all GET requests for authentication
//  */
// export async function GET(req: Request) {
//   return auth.handler(req);
// }

// /**
//  * Handles all POST requests for authentication
//  */
// export async function POST(req: Request) {
//   return auth.handler(req);
// }



import { auth } from "@/lib/betterAuth"; // Adjust this path to your auth config file
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);