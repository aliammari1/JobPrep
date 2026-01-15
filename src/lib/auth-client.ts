import { createAuthClient } from "better-auth/react";
import {
  usernameClient,
  twoFactorClient,
  adminClient,
  organizationClient,
  magicLinkClient,
  emailOTPClient,
  phoneNumberClient,
  multiSessionClient,
} from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    usernameClient(),
    twoFactorClient(),
    adminClient(),
    organizationClient(),
    magicLinkClient(),
    emailOTPClient(),
    phoneNumberClient(),
    passkeyClient(),
    multiSessionClient(),
  ],
});

// Export commonly used methods for convenience
export const { signIn, signUp, signOut, useSession } = authClient;

// For plugin-specific methods, use authClient.pluginName
// e.g., authClient.twoFactor, authClient.admin, authClient.organization, etc.
