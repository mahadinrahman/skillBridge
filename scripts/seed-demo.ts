import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

async function run() {
  const { getAuthServer } = await import("../src/lib/auth");
  const auth = await getAuthServer();
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: "demo@skillbridge.com",
        password: "password123",
        name: "Demo Student",
      },
      headers: new Headers(),
    });
    console.log("Demo user seeded successfully:", res);
  } catch (err: any) {
    console.log("Demo user seeding message:", err.message || err);
  }
  process.exit(0);
}

run();
