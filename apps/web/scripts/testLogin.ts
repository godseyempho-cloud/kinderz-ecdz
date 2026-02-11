

async function main() {
  const res = await fetch("http://localhost:3000/api/auth/better-auth", {
      method: "POST",
          headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                    email: "test@example.com",
                          password: "test1234",
                              }),
                                });

                                  const data = await res.json();
                                    console.log("Login response:", data);
                                    }

                                    main();
                                    