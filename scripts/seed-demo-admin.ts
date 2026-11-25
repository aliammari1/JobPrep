/**
 * Seed the local demo admin account.
 *
 * Creates (or resets) a pre-verified admin user for demos:
 *   username: admin
 *   email:    admin@jobprep.local
 *   password: $Admin2026
 *
 * The password goes through Better Auth's own email sign-up (so hashing and
 * validation stay canonical); the script then marks the email verified and
 * grants the admin role so the account can sign in immediately with no
 * mailbox configured.
 *
 * Usage (app must be running — default `bun run dev`, any port):
 *   APP_URL=http://localhost:3001 bun scripts/seed-demo-admin.ts
 *
 * Local-dev only. Never run against production.
 */
import prisma from "../src/lib/prisma";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const DEMO = {
  name: "Demo Admin",
  email: "admin@jobprep.local",
  username: "admin",
  password: "$Admin2026",
};

async function signUp(): Promise<void> {
  const signUpRes = await fetch(`${APP_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: DEMO.name,
      email: DEMO.email,
      username: DEMO.username,
      password: DEMO.password,
      callbackURL: "/dashboard",
    }),
  });
  const signUpBody = (await signUpRes.json()) as {
    user?: { id: string };
    code?: string;
    message?: string;
  };
  if (signUpRes.ok) {
    console.log(`Created demo user ${DEMO.email}`);
    return;
  }
  if (signUpBody.code === "USER_ALREADY_EXISTS") {
    // Local-dev seed: recreate so the documented password always works.
    // Accounts/sessions cascade-delete from the user row.
    await prisma.user.delete({ where: { email: DEMO.email } });
    console.log("Removed stale demo user — recreating");
    return signUp();
  }
  throw new Error(
    `Sign-up failed: ${signUpRes.status} ${JSON.stringify(signUpBody)}`,
  );
}

async function main() {
  // 1. Sign up through Better Auth (canonical hashing + validation).
  await signUp();

  // 3. Mark verified + grant admin role so login works with no mailbox.
  const user = await prisma.user.update({
    where: { email: DEMO.email },
    data: { emailVerified: true, role: "admin", name: DEMO.name },
  });

  console.log(`Demo admin ready:
  username: ${DEMO.username}
  email:    ${DEMO.email}
  password: ${DEMO.password}
  id:       ${user.id}
  role:     ${user.role} (verified: ${user.emailVerified})`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
