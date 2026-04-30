import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    // Using your specific GitHub Codespaces URL
    baseURL: "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",
    plugins: [
        adminClient() 
    ],
    // This maps your custom Prisma fields so they are 
    // accessible on the client-side session object.
    metadata: {
        role: "string",
        ecdCenterId: "string",
        districtId: "string",
        provinceId: "string"
    },
    fetchOptions: {
        onError(context) {
            console.error("Auth Client Error:", context.error);
        }
    }
});