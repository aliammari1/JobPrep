/**
 * Environment Variable Validation Utility
 * Ensures all required API keys and configurations are present
 */

interface EnvCheck {
  key: string;
  required: boolean;
  description: string;
  category: "ai" | "video" | "email" | "database" | "auth";
}

const ENV_CHECKS: EnvCheck[] = [
  // AI Configuration
  {
    key: "OPENAI_API_KEY",
    required: true,
    description:
      "OpenAI API key for AI-powered features (question generation, feedback)",
    category: "ai",
  },

  // LiveKit Video Configuration
  {
    key: "LIVEKIT_API_KEY",
    required: true,
    description: "LiveKit API key for video interview rooms",
    category: "video",
  },
  {
    key: "LIVEKIT_API_SECRET",
    required: true,
    description: "LiveKit API secret for token generation",
    category: "video",
  },
  {
    key: "NEXT_PUBLIC_LIVEKIT_URL",
    required: true,
    description:
      "LiveKit WebSocket URL (e.g., wss://your-project.livekit.cloud)",
    category: "video",
  },

  // Database
  {
    key: "DATABASE_URL",
    required: true,
    description: "PostgreSQL database connection string",
    category: "database",
  },

  // Email Service (Gmail)
  {
    key: "GMAIL_USER_EMAIL",
    required: false,
    description:
      "Gmail email address for sending emails (e.g., your-email@gmail.com)",
    category: "email",
  },
  {
    key: "GMAIL_APP_PASSWORD",
    required: false,
    description:
      "Gmail App Password (16-character password from myaccount.google.com/apppasswords)",
    category: "email",
  },

  // Authentication
  {
    key: "BETTER_AUTH_SECRET",
    required: true,
    description: "Better Auth secret key for session management",
    category: "auth",
  },
  {
    key: "BETTER_AUTH_URL",
    required: true,
    description: "Better Auth base URL",
    category: "auth",
  },
];

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  configured: string[];
  warnings: string[];
}

export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const configured: string[] = [];
  const warnings: string[] = [];

  ENV_CHECKS.forEach(({ key, required, description, category }) => {
    const value = process.env[key];

    if (
      !value ||
      value === "" ||
      value.includes("placeholder") ||
      value.includes("your_")
    ) {
      if (required) {
        missing.push(`${key} (${description})`);
      } else {
        warnings.push(`${key} is not configured - ${description}`);
      }
    } else {
      configured.push(key);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
    configured,
    warnings,
  };
}

export function getEnvStatus() {
  const result = validateEnvironment();

  return {
    ...result,
    aiEnabled:
      !!process.env.OPENAI_API_KEY &&
      !process.env.OPENAI_API_KEY.includes("placeholder"),
    videoEnabled:
      !!process.env.LIVEKIT_API_KEY &&
      !process.env.LIVEKIT_API_KEY.includes("placeholder"),
    databaseConnected: !!process.env.DATABASE_URL,
    authConfigured:
      !!process.env.BETTER_AUTH_SECRET &&
      !process.env.BETTER_AUTH_SECRET.includes("placeholder"),
  };
}

export function printEnvStatus() {
  const status = getEnvStatus();

  console.log("\n🔍 Environment Configuration Status\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("✅ Configured:");
  status.configured.forEach((key) => {
    console.log(`  • ${key}`);
  });

  if (status.missing.length > 0) {
    console.log("\n❌ Missing Required Variables:");
    status.missing.forEach((item) => {
      console.log(`  • ${item}`);
    });
  }

  if (status.warnings.length > 0) {
    console.log("\n⚠️  Optional Variables:");
    status.warnings.forEach((warning) => {
      console.log(`  • ${warning}`);
    });
  }

  console.log("\n📊 Feature Status:");
  console.log(
    `  • AI Features: ${status.aiEnabled ? "✅ Enabled" : "❌ Disabled"}`
  );
  console.log(
    `  • Video Interviews: ${
      status.videoEnabled ? "✅ Enabled" : "❌ Disabled"
    }`
  );
  console.log(
    `  • Database: ${
      status.databaseConnected ? "✅ Connected" : "❌ Not Connected"
    }`
  );
  console.log(
    `  • Authentication: ${
      status.authConfigured ? "✅ Configured" : "❌ Not Configured"
    }`
  );

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (!status.valid) {
    console.log("⚠️  Some required environment variables are missing.");
    console.log("Please check your .env.local file.\n");
  }
}
