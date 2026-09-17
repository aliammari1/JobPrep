import { ApiReference } from "@scalar/nextjs-api-reference";

/**
 * In-app interactive API reference (Scalar) for the JobPrep API.
 * Reads the spec served by /api/openapi so it always reflects the live
 * `@swagger`-annotated route handlers.
 */
export const GET = ApiReference({
  spec: {
    url: "/api/openapi",
  },
  theme: "purple",
  metaData: {
    title: "JobPrep API Reference",
  },
});
