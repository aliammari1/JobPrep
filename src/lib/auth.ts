import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import {
  admin,
  emailOTP,
  magicLink,
  multiSession,
  organization,
  phoneNumber,
  twoFactor,
  username,
} from "better-auth/plugins";
import { emailTemplates, sendEmail } from "./email";
import prisma from "./prisma";

export const auth = betterAuth({
  basePath: "/api/auth",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Local dev runs on whatever port is free (3000 is often taken), so the
  // request origin rarely matches BETTER_AUTH_URL exactly. Trust the
  // request's own origin for loopback hosts in non-production only —
  // production keeps the static BETTER_AUTH_URL-derived list.
  trustedOrigins: async (req?: Request) => {
    if (process.env.NODE_ENV === "production") return [];
    const origin = req?.headers.get("origin");
    if (!origin) return [];
    try {
      const url = new URL(origin);
      if (
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        url.hostname === "[::1]"
      ) {
        return [origin];
      }
    } catch {
      // Ignore malformed origins — the default check rejects them.
    }
    return [];
  },

  // Email and password authentication configuration
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      const template = emailTemplates.resetPassword(url, user.name);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    },
  },

  // Email verification configuration
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const template = emailTemplates.verifyEmail(url, user.name);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    },
  },

  // Social providers configuration
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // Account configuration
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  // Security headers
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  // Plugins
  plugins: [
    nextCookies(),
    username(),

    // Two-Factor Authentication with OTP
    twoFactor({
      issuer: process.env.APP_NAME || "JobPrep",
      otpOptions: {
        period: 30,
        async sendOTP({ user, otp }) {
          const template = emailTemplates.twoFactorOTP(otp, user.name);
          await sendEmail({
            to: user.email,
            subject: template.subject,
            html: template.html,
            text: template.text,
          });
        },
      },
    }),

    // Magic Link Authentication
    magicLink({
      async sendMagicLink({ email, url, token }) {
        const template = emailTemplates.magicLink(url, email);
        await sendEmail({
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
      },
      expiresIn: 60 * 10, // 10 minutes
    }),

    // Email OTP Authentication
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const template = emailTemplates.emailOTP(otp, type);
        await sendEmail({
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
      },
      expiresIn: 60 * 5, // 5 minutes
      otpLength: 6,
    }),

    // Phone Number Authentication
    phoneNumber({
      async sendOTP({ phoneNumber, code }) {
        // In development, log the OTP
        if (process.env.NODE_ENV === "development") {
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          console.log("📱 Phone OTP (Development Mode)");
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          console.log(`Phone: ${phoneNumber}`);
          console.log(`OTP Code: ${code}`);
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        }

        // In production, integrate with SMS service like Twilio
        // To enable Twilio:
        // 1. Install twilio: npm install twilio
        // 2. Set environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
        // 3. Uncomment the code below
        /*
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
          try {
            const twilio = require('twilio');
            const client = twilio(
              process.env.TWILIO_ACCOUNT_SID,
              process.env.TWILIO_AUTH_TOKEN
            );
            await client.messages.create({
              body: `Your JobPrep verification code is: ${code}`,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: phoneNumber,
            });
          } catch (error) {
            console.error('Failed to send SMS via Twilio:', error);
          }
        }
        */
      },
      async sendPasswordResetOTP({ phoneNumber, code }) {
        // Similar implementation for password reset
        if (process.env.NODE_ENV === "development") {
          console.log(`Password Reset OTP for ${phoneNumber}: ${code}`);
        }
      },
    }),

    // Passkey Authentication (WebAuthn)
    passkey(),

    // Multi-Session Support
    multiSession(),

    // Admin Plugin
    admin(),

    // Organization/Teams Plugin
    organization({
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${data.id}`;
        const template = emailTemplates.organizationInvite(
          data.organization.name,
          inviteLink,
          data.inviter.user.name,
        );
        await sendEmail({
          to: data.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
      },
    }),
  ],
});
