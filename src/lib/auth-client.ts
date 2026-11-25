import { passkeyClient } from "@better-auth/passkey/client";
import {
  adminClient,
  emailOTPClient,
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  phoneNumberClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  // Same-origin: the browser app and the auth API are served by the same
  // Next.js server. A hardcoded absolute URL (e.g. localhost:3000) breaks
  // auth whenever dev runs on another port — requests would go elsewhere.
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
