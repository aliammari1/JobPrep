import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructured } from "@/lib/ai/generate";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/observability";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

const VALID_NODE_TYPES = [
  "client",
  "cdn",
  "load-balancer",
  "api-gateway",
  "service",
  "database",
  "cache",
  "queue",
  "storage",
] as const;

type NodeTypeId = (typeof VALID_NODE_TYPES)[number];

const requestSchema = z.object({
  prompt: z.string().trim().min(5, "Prompt is too short").max(2000),
  role: z.string().trim().max(140).optional(),
  company: z.string().trim().max(120).optional(),
});

const aiDiagramSchema = z.object({
  nodes: z
    .array(
      z.object({
        id: z.string().min(1),
        type: z.enum(VALID_NODE_TYPES),
        label: z.string().min(1).max(40),
      }),
    )
    .min(3)
    .max(10),
  edges: z
    .array(
      z.object({
        from: z.string().min(1),
        to: z.string().min(1),
        label: z.string().max(20).optional(),
      }),
    )
    .min(2)
    .max(16),
});

/** Assign clean, non-overlapping horizontal tier coordinates by component role. */
function layoutNodes(
  rawNodes: { id: string; type: NodeTypeId; label: string }[],
) {
  const tierForType: Record<NodeTypeId, number> = {
    client: 0,
    cdn: 1,
    "load-balancer": 1,
    "api-gateway": 1,
    service: 2,
    cache: 3,
    database: 3,
    queue: 3,
    storage: 3,
  };

  const buckets = new Map<number, { id: string; type: NodeTypeId; label: string }[]>();
  for (const node of rawNodes) {
    const tier = tierForType[node.type] ?? 2;
    const list = buckets.get(tier) ?? [];
    list.push(node);
    buckets.set(tier, list);
  }

  const tierX = [32, 235, 442, 654];
  const positioned: {
    id: string;
    type: NodeTypeId;
    label: string;
    x: number;
    y: number;
  }[] = [];

  for (const [tier, list] of buckets.entries()) {
    const x = tierX[tier] ?? 442;
    const totalHeight = list.length * 105;
    const startY = Math.max(36, Math.round((500 - totalHeight) / 2) + 20);
    list.forEach((node, idx) => {
      positioned.push({
        ...node,
        x,
        y: Math.min(430, startY + idx * 108),
      });
    });
  }

  return positioned;
}

export async function POST(request: Request) {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const limit = await rateLimit(request, "ai");
    if (!limit.success) return rateLimitResponse(limit);

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a clear system design prompt (at least 5 characters)." },
        { status: 400 },
      );
    }

    const { prompt, role, company } = parsed.data;
    const contextLine =
      role && company ? `Target interview role: ${role} at ${company}.` : "";

    const diagram = await generateStructured({
      schema: aiDiagramSchema,
      functionId: "generate-system-architecture",
      instructions: [
        "You are a Staff Distributed Systems Architect.",
        "Return a JSON object with `nodes` (5 to 8 components) and `edges` (directional data flows).",
        `Each node.type MUST be one of: ${VALID_NODE_TYPES.join(", ")}.`,
        "Use short, concrete labels (e.g. 'Web Clients', 'Edge API Gateway', 'Order Service', 'Redis Cache', 'PostgreSQL Primary', 'Event Queue').",
        "Every edge.from and edge.to MUST match an existing node.id.",
      ].join(" "),
      prompt: `${contextLine}\nDesign a production architecture for: ${prompt}\n\nReturn JSON: { "nodes": [{ "id": "n1", "type": "client", "label": "..." }], "edges": [{ "from": "n1", "to": "n2", "label": "HTTPS" }] }`,
    });

    const positionedNodes = layoutNodes(diagram.nodes);
    const validIds = new Set(positionedNodes.map((n) => n.id));
    const cleanEdges = diagram.edges
      .filter((e) => validIds.has(e.from) && validIds.has(e.to) && e.from !== e.to)
      .map((e, idx) => ({
        id: `edge-ai-${Date.now()}-${idx}`,
        from: e.from,
        to: e.to,
        ...(e.label ? { label: e.label } : {}),
      }));

    return NextResponse.json({
      nodes: positionedNodes,
      edges: cleanEdges,
    });
  } catch (error) {
    captureApiError("POST /api/ai/generate-architecture", error, { userId });
    return NextResponse.json(
      { error: "Failed to generate architecture from prompt. Please try again." },
      { status: 500 },
    );
  }
}
