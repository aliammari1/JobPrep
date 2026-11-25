import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructured } from "@/lib/ai/generate";
import {
  DEFAULT_MODEL_ID,
  isKnownModel,
  parseModelId,
} from "@/lib/ai/providers";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/observability";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const maxDuration = 60;

const architectureNodeSchema = z.object({
  id: z.string().min(1).max(120),
  type: z.string().min(1).max(64),
  label: z.string().min(1).max(120),
});

const architectureEdgeSchema = z.object({
  from: z.string().min(1).max(120),
  to: z.string().min(1).max(120),
  label: z.string().max(120).optional(),
});

const critiqueRequestSchema = z.object({
  prompt: z.string().trim().min(1, "Scenario prompt is required").max(2000),
  nodes: z.array(architectureNodeSchema).max(60),
  edges: z.array(architectureEdgeSchema).max(120),
  model: z.string().optional(),
});

const critiqueOutputSchema = z.object({
  score: z.number().int().min(0).max(100),
  summary: z.string().min(1),
  strengths: z.array(z.string()).min(1).max(8),
  bottlenecks: z.array(z.string()).max(8),
  recommendations: z.array(z.string()).min(1).max(8),
});

type ArchitectureNode = z.infer<typeof architectureNodeSchema>;
type ArchitectureEdge = z.infer<typeof architectureEdgeSchema>;
type CritiqueResult = z.infer<typeof critiqueOutputSchema>;

function hasProviderCredentials(modelId: string): boolean {
  try {
    const { provider } = parseModelId(modelId);
    switch (provider) {
      case "pollinations":
        return true;
      case "anthropic":
        return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
      case "openai":
        return Boolean(process.env.OPENAI_API_KEY?.trim());
      case "gemini":
        return Boolean(
          process.env.GEMINI_API_KEY?.trim() ||
            process.env.GOOGLE_API_KEY?.trim(),
        );
      case "ollama":
        return Boolean(
          process.env.OLLAMA_API_KEY?.trim() || process.env.OLLAMA_HOST?.trim(),
        );
      default:
        return false;
    }
  } catch {
    return false;
  }
}

function normalizeType(type: string, label: string): string {
  const combined = `${type} ${label}`.toLowerCase();
  if (combined.includes("client") || combined.includes("browser") || combined.includes("mobile")) {
    return "client";
  }
  if (combined.includes("cdn") || combined.includes("edge")) {
    return "cdn";
  }
  if (combined.includes("load") || combined.includes("balancer") || combined.includes("lb")) {
    return "load-balancer";
  }
  if (combined.includes("gateway") || combined.includes("api-gateway")) {
    return "api-gateway";
  }
  if (combined.includes("redis") || combined.includes("cache") || combined.includes("memcached")) {
    return "cache";
  }
  if (
    combined.includes("queue") ||
    combined.includes("kafka") ||
    combined.includes("rabbitmq") ||
    combined.includes("sqs") ||
    combined.includes("pubsub")
  ) {
    return "queue";
  }
  if (
    combined.includes("storage") ||
    combined.includes("r2") ||
    combined.includes("s3") ||
    combined.includes("blob")
  ) {
    return "storage";
  }
  if (
    combined.includes("postgres") ||
    combined.includes("database") ||
    combined.includes("db") ||
    combined.includes("sql") ||
    combined.includes("mongo")
  ) {
    return "database";
  }
  return "service";
}

function buildHeuristicCritique(
  prompt: string,
  nodes: ArchitectureNode[],
  edges: ArchitectureEdge[],
): CritiqueResult {
  const promptLower = prompt.toLowerCase();
  const strengths: string[] = [];
  const bottlenecks: string[] = [];
  const recommendations: string[] = [];

  if (nodes.length === 0) {
    return {
      score: 10,
      summary:
        "The canvas has no components yet. Start by placing entry clients, an API tier, and a primary data store so traffic flow can be evaluated.",
      strengths: ["Clear problem statement defined before drawing components."],
      bottlenecks: [
        "No architecture components or data flow paths are defined on the canvas.",
      ],
      recommendations: [
        "Add a Client, Load Balancer, core Service, and PostgreSQL database to establish a baseline request path.",
        "Connect components with directional edges to show read and write paths.",
      ],
    };
  }

  const byCategory = new Map<string, ArchitectureNode[]>();
  for (const node of nodes) {
    const cat = normalizeType(node.type, node.label);
    const existing = byCategory.get(cat) ?? [];
    existing.push(node);
    byCategory.set(cat, existing);
  }

  const clients = byCategory.get("client") ?? [];
  const cdns = byCategory.get("cdn") ?? [];
  const lbs = byCategory.get("load-balancer") ?? [];
  const gateways = byCategory.get("api-gateway") ?? [];
  const services = byCategory.get("service") ?? [];
  const databases = byCategory.get("database") ?? [];
  const caches = byCategory.get("cache") ?? [];
  const queues = byCategory.get("queue") ?? [];
  const storages = byCategory.get("storage") ?? [];

  const connectedIds = new Set<string>();
  const validNodeIds = new Set(nodes.map((n) => n.id));
  const validEdges = edges.filter(
    (e) => validNodeIds.has(e.from) && validNodeIds.has(e.to),
  );
  for (const edge of validEdges) {
    connectedIds.add(edge.from);
    connectedIds.add(edge.to);
  }
  const orphanNodes = nodes.filter((n) => !connectedIds.has(n.id));

  let score = 48;

  // 1. Entry & Traffic Distribution
  if (lbs.length > 0 || gateways.length > 0) {
    score += 12;
    const entryNames = [...lbs, ...gateways].map((n) => n.label).join(", ");
    strengths.push(
      `Ingress traffic is fronted by ${entryNames}, enabling horizontal scaling, TLS termination, and request routing.`,
    );
  } else {
    score -= 10;
    bottlenecks.push(
      "Missing Load Balancer or API Gateway: traffic appears to hit application instances directly, creating a single point of failure and blocking horizontal scaling.",
    );
    recommendations.push(
      "Introduce a Load Balancer or API Gateway in front of stateless services for health checks, rate limiting, and zero-downtime deploys.",
    );
  }

  // 2. Caching Layer
  if (caches.length > 0) {
    score += 12;
    strengths.push(
      `Includes a dedicated caching tier (${caches.map((n) => n.label).join(", ")}) to absorb hot reads and cut database latency.`,
    );
  } else if (databases.length > 0 || promptLower.includes("url") || promptLower.includes("commerce") || promptLower.includes("read")) {
    score -= 8;
    bottlenecks.push(
      "No Redis/cache layer detected: repetitive read queries will hit the primary database directly and saturate connections under traffic spikes.",
    );
    recommendations.push(
      "Add a Redis Cache (cache-aside or read-through) for hot keys, session state, and rate-limit counters with explicit TTLs.",
    );
  }

  // 3. Database & Single Point of Failure
  if (databases.length === 0 && storages.length === 0) {
    score -= 10;
    bottlenecks.push(
      "No persistent data store (PostgreSQL or Object Storage) is modeled for durable state.",
    );
    recommendations.push(
      "Add a durable primary database (PostgreSQL) and clarify the data model and indexing strategy.",
    );
  } else if (databases.length === 1) {
    strengths.push(
      `Persistent relational storage is explicitly modeled via ${databases[0].label}.`,
    );
    bottlenecks.push(
      `Single database instance (${databases[0].label}) is a potential single point of failure (SPOF) and write bottleneck at high scale.`,
    );
    recommendations.push(
      "Plan for primary-replica replication for read scaling, automated failover, and connection pooling (e.g., PgBouncer).",
    );
  } else if (databases.length >= 2) {
    score += 8;
    strengths.push(
      `Multiple data stores (${databases.map((n) => n.label).join(", ")}) reduce single-database contention and support workload isolation.`,
    );
  }

  // 4. Async Processing / Message Queue
  const needsAsync =
    promptLower.includes("chat") ||
    promptLower.includes("checkout") ||
    promptLower.includes("commerce") ||
    promptLower.includes("notification") ||
    promptLower.includes("analytics") ||
    services.length >= 2;

  if (queues.length > 0) {
    score += 10;
    strengths.push(
      `Asynchronous decoupling via ${queues.map((n) => n.label).join(", ")} isolates slow background work and smooths burst traffic.`,
    );
  } else if (needsAsync) {
    score -= 6;
    bottlenecks.push(
      "No Message Queue detected: side effects (analytics, webhooks, notifications, or fan-out) risk blocking synchronous request latency.",
    );
    recommendations.push(
      "Add a Message Queue with idempotent consumers and a dead-letter queue (DLQ) for background jobs and event fan-out.",
    );
  }

  // 5. Edge / CDN & Object Storage
  if (cdns.length > 0) {
    score += 6;
    strengths.push(
      `Edge delivery via ${cdns.map((n) => n.label).join(", ")} minimizes global round-trip latency for end users.`,
    );
  } else if (
    promptLower.includes("global") ||
    promptLower.includes("url") ||
    promptLower.includes("commerce")
  ) {
    recommendations.push(
      "Place a CDN / Edge layer in front of static assets or edge redirects to reduce cross-region latency.",
    );
  }

  if (storages.length > 0) {
    score += 4;
    strengths.push(
      `Offloads unstructured payloads or assets to ${storages.map((n) => n.label).join(", ")}.`,
    );
  }

  // 6. Service Decomposition & Client Entry
  if (clients.length > 0 && services.length > 0) {
    score += 6;
  } else if (services.length === 0) {
    score -= 10;
    bottlenecks.push(
      "No application service tier is present to host business logic, validation, and authentication.",
    );
    recommendations.push(
      "Add one or more stateless Service nodes to separate business logic from ingress and storage.",
    );
  }

  // 7. Graph Connectivity
  if (validEdges.length === 0 && nodes.length > 1) {
    score -= 12;
    bottlenecks.push(
      "Components are not connected with edges, making request paths and failure boundaries ambiguous.",
    );
    recommendations.push(
      "Use Connect mode to trace end-to-end read and write paths across your components.",
    );
  } else if (orphanNodes.length > 0) {
    score -= Math.min(10, orphanNodes.length * 4);
    bottlenecks.push(
      `${orphanNodes.length} disconnected component(s) (${orphanNodes.map((n) => n.label).join(", ")}) have no incoming or outgoing edges.`,
    );
    recommendations.push(
      "Connect or remove orphan nodes so every component has a clear role in the request lifecycle.",
    );
  } else if (validEdges.length >= nodes.length - 1) {
    score += 6;
    strengths.push(
      `All ${nodes.length} components are wired into a cohesive flow across ${validEdges.length} directional connections.`,
    );
  }

  const clampedScore = Math.max(15, Math.min(96, Math.round(score)));

  if (strengths.length === 0) {
    strengths.push(
      `Initial architecture outlines ${nodes.length} component(s) as a starting point for iteration.`,
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      "Document SLA targets, back-of-the-envelope QPS/storage estimates, and observability (metrics, distributed tracing, alerting).",
    );
  }

  const tierLabel =
    clampedScore >= 85
      ? "Production-ready foundation"
      : clampedScore >= 70
        ? "Solid architecture with targeted hardening opportunities"
        : clampedScore >= 50
          ? "Workable baseline with key scalability gaps"
          : "Early draft requiring core distributed-systems layers";

  return {
    score: clampedScore,
    summary: `${tierLabel}: evaluated ${nodes.length} components and ${validEdges.length} connections for "${prompt.slice(0, 90)}${prompt.length > 90 ? "…" : ""}".`,
    strengths: strengths.slice(0, 6),
    bottlenecks: bottlenecks.slice(0, 6),
    recommendations: recommendations.slice(0, 6),
  };
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await rateLimit(req, "ai");
  if (!limit.success) return rateLimitResponse(limit);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = critiqueRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { prompt, nodes, edges, model: requestedModel } = parsed.data;
  if (requestedModel && !isKnownModel(requestedModel)) {
    return NextResponse.json(
      { error: `Unknown model: ${requestedModel}` },
      { status: 400 },
    );
  }

  const modelId = requestedModel ?? DEFAULT_MODEL_ID;

  if (!hasProviderCredentials(modelId)) {
    const heuristic = buildHeuristicCritique(prompt, nodes, edges);
    return NextResponse.json({ ...heuristic, source: "heuristic" as const });
  }

  try {
    const nodeSummary =
      nodes.length > 0
        ? nodes.map((n) => `- [${n.id}] (${n.type}) ${n.label}`).join("\n")
        : "(no nodes)";

    const nodeLabelById = new Map(nodes.map((n) => [n.id, n.label]));
    const edgeSummary =
      edges.length > 0
        ? edges
            .map((e) => {
              const fromLabel = nodeLabelById.get(e.from) ?? e.from;
              const toLabel = nodeLabelById.get(e.to) ?? e.to;
              return `- ${fromLabel} -> ${toLabel}${e.label ? ` (${e.label})` : ""}`;
            })
            .join("\n")
        : "(no edges)";

    const critique = await generateStructured({
      schema: critiqueOutputSchema,
      modelId,
      functionId: "system-design-critique",
      instructions:
        "You are a Staff Distributed Systems Engineer conducting a system design interview review. Evaluate scalability, single points of failure, latency, consistency, caching, async processing, and data flow clarity. Be concrete, concise, and reference the candidate's actual component names.",
      prompt: [
        `Scenario: ${prompt}`,
        "",
        "Architecture Components:",
        nodeSummary,
        "",
        "Directional Connections:",
        edgeSummary,
        "",
        "Return a structured critique with an overall score (0-100), a concise 1-2 sentence summary, strengths, bottlenecks, and actionable recommendations.",
      ].join("\n"),
    });

    return NextResponse.json({ ...critique, source: "ai" as const });
  } catch (error) {
    captureApiError("POST /api/ai/critique-architecture", error, {
      userId: session.user.id,
      extra: { modelId },
    });
    const heuristic = buildHeuristicCritique(prompt, nodes, edges);
    return NextResponse.json({ ...heuristic, source: "heuristic" as const });
  }
}
