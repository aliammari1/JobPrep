import { createSwaggerSpec } from "next-swagger-doc";

/**
 * OpenAPI spec for the JobPrep API.
 *
 * `next-swagger-doc` scans `@swagger` JSDoc annotations across the route
 * handlers under `src/app/api`. New endpoints become documented simply by
 * adding a `@swagger` block above their handler — no central registry to keep
 * in sync. The `definition` below supplies the shared metadata, servers, tags
 * and security schemes.
 */
export function getApiDocs() {
  return createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "JobPrep API",
        version: "0.1.0",
        description:
          "REST API for JobPrep — an AI-powered career-preparation platform " +
          "(CV builder, mock interviews, coding arena, and a provider-agnostic " +
          "AI Coach). 80+ route handlers back the web app and the Chrome extension.",
        license: {
          name: "Source-Available License 1.0",
          identifier: "LicenseRef-Source-Available-1.0",
        },
      },
      servers: [
        { url: "/", description: "Same-origin (current deployment)" },
        { url: "http://localhost:3000", description: "Local development" },
      ],
      tags: [
        { name: "AI", description: "AI Coach, question generation, feedback" },
        { name: "CV", description: "CV builder, enhancement and export" },
        { name: "Interviews", description: "Mock interviews and scheduling" },
        { name: "Billing", description: "Stripe subscriptions" },
        { name: "System", description: "Health and diagnostics" },
      ],
      components: {
        securitySchemes: {
          sessionCookie: {
            type: "apiKey",
            in: "cookie",
            name: "better-auth.session_token",
            description: "Better Auth session cookie.",
          },
        },
      },
      security: [{ sessionCookie: [] }],
    },
  });
}
