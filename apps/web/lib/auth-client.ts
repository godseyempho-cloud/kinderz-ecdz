// // lib/auth-client.ts
// import { createAuthClient } from "better-auth/react";

// export const authClient = createAuthClient({
//     baseURL: "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev", // Your site URL
// });

// import { createAuthClient } from "better-auth/react";
// import { adminClient } from "better-auth/client/plugins";

// export const authClient = createAuthClient({
//     baseURL: "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",
//     plugins: [
//         adminClient() // This is required to fix the 'role' and 'data' issues
//     ]
// });


// import { createAuthClient } from "better-auth/react";
// import { adminClient } from "better-auth/client/plugins";

// export const authClient = createAuthClient({
//     baseURL: "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",
//     plugins: [
//         adminClient()
//     ],
//     // This is the key: it tells the client these fields exist on the user
//     fetchOptions: {
//         onError(context) {
//             console.error(context.error);
//         }
//     }
// });


import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",
    plugins: [
        adminClient()
    ],
    // ADD THIS BLOCK: It maps your database fields to the client types
    metadata: {
        role: "string",
        ecdCenterId: "string",
        districtId: "string",
        provinceId: "string"
    }
});