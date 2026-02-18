// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev", // Your site URL
});