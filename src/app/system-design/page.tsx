"use client";

import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Cpu,
  Database,
  Download,
  Globe,
  HardDrive,
  History,
  Layers,
  Lightbulb,
  Link2,
  Loader2,
  Mail,
  Monitor,
  Network,
  Play,
  RotateCcw,
  Save,
  Server,
  Shield,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type NodeTypeId =
  | "client"
  | "cdn"
  | "load-balancer"
  | "api-gateway"
  | "service"
  | "database"
  | "cache"
  | "queue"
  | "storage";

interface CanvasNode {
  id: string;
  type: NodeTypeId;
  label: string;
  x: number;
  y: number;
}

interface CanvasEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

interface ScenarioPreset {
  id: string;
  name: string;
  prompt: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

interface CritiqueResponse {
  score: number;
  summary: string;
  strengths: string[];
  bottlenecks: string[];
  recommendations: string[];
  source: "ai" | "heuristic";
}

interface SavedDesignSession {
  id: string;
  title: string;
  prompt: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  score: number | null;
  critique: CritiqueResponse | null;
  applicationId: string | null;
  updatedAt: string;
}

interface LinkedApplicationContext {
  id: string;
  company: string;
  role: string;
}

const NODE_WIDTH = 164;
const NODE_HEIGHT = 64;
const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 520;

const PALETTE: {
  type: NodeTypeId;
  label: string;
  shortLabel: string;
  icon: typeof Monitor;
}[] = [
  { type: "client", label: "Client", shortLabel: "Client", icon: Monitor },
  { type: "cdn", label: "CDN / Edge", shortLabel: "CDN / Edge", icon: Globe },
  {
    type: "load-balancer",
    label: "Load Balancer",
    shortLabel: "Load Balancer",
    icon: Network,
  },
  {
    type: "api-gateway",
    label: "API Gateway",
    shortLabel: "API Gateway",
    icon: Shield,
  },
  { type: "service", label: "Service", shortLabel: "Service", icon: Server },
  {
    type: "database",
    label: "PostgreSQL",
    shortLabel: "PostgreSQL",
    icon: Database,
  },
  {
    type: "cache",
    label: "Redis Cache",
    shortLabel: "Redis Cache",
    icon: Layers,
  },
  {
    type: "queue",
    label: "Message Queue",
    shortLabel: "Message Queue",
    icon: Mail,
  },
  {
    type: "storage",
    label: "Object Storage / R2",
    shortLabel: "Object Storage",
    icon: HardDrive,
  },
];

const PALETTE_MAP = new Map(PALETTE.map((item) => [item.type, item]));

const SCENARIOS: ScenarioPreset[] = [
  {
    id: "url-shortener",
    name: "URL Shortener",
    prompt:
      "Design a global URL shortener handling 100M daily redirects (100:1 read/write ratio) with sub-50ms p99 latency, custom aliases, and click analytics.",
    nodes: [
      { id: "n-client", type: "client", label: "Web & Mobile Clients", x: 32, y: 220 },
      { id: "n-cdn", type: "cdn", label: "Global CDN / Edge", x: 230, y: 120 },
      { id: "n-lb", type: "load-balancer", label: "Load Balancer", x: 230, y: 310 },
      { id: "n-svc", type: "service", label: "Redirect & Shorten API", x: 438, y: 220 },
      { id: "n-cache", type: "cache", label: "Redis Hot-Key Cache", x: 654, y: 110 },
      { id: "n-db", type: "database", label: "PostgreSQL Primary", x: 654, y: 230 },
      { id: "n-q", type: "queue", label: "Click Events Queue", x: 654, y: 350 },
    ],
    edges: [
      { id: "e-1", from: "n-client", to: "n-cdn", label: "GET /:code" },
      { id: "e-2", from: "n-client", to: "n-lb", label: "POST /shorten" },
      { id: "e-3", from: "n-cdn", to: "n-svc", label: "Cache miss" },
      { id: "e-4", from: "n-lb", to: "n-svc", label: "HTTP" },
      { id: "e-5", from: "n-svc", to: "n-cache", label: "Lookup" },
      { id: "e-6", from: "n-svc", to: "n-db", label: "Persist" },
      { id: "e-7", from: "n-svc", to: "n-q", label: "Async clicks" },
    ],
  },
  {
    id: "realtime-chat",
    name: "Real-Time Chat",
    prompt:
      "Design a multi-device real-time chat platform supporting 1:1 and group channels (up to 500 members), presence indicators, message history, and media attachments.",
    nodes: [
      { id: "c-client", type: "client", label: "Chat Clients (WS)", x: 32, y: 215 },
      { id: "c-gw", type: "api-gateway", label: "WebSocket Gateway", x: 240, y: 215 },
      { id: "c-svc", type: "service", label: "Chat & Presence Svc", x: 452, y: 145 },
      { id: "c-cache", type: "cache", label: "Redis Pub/Sub", x: 452, y: 315 },
      { id: "c-db", type: "database", label: "PostgreSQL Messages", x: 664, y: 120 },
      { id: "c-storage", type: "storage", label: "Media Storage / R2", x: 664, y: 245 },
      { id: "c-q", type: "queue", label: "Push Notify Queue", x: 664, y: 370 },
    ],
    edges: [
      { id: "ce-1", from: "c-client", to: "c-gw", label: "WSS" },
      { id: "ce-2", from: "c-gw", to: "c-svc", label: "Send msg" },
      { id: "ce-3", from: "c-svc", to: "c-cache", label: "Fan-out" },
      { id: "ce-4", from: "c-svc", to: "c-db", label: "Store" },
      { id: "ce-5", from: "c-svc", to: "c-storage", label: "Signed URL" },
      { id: "ce-6", from: "c-svc", to: "c-q", label: "Offline push" },
    ],
  },
  {
    id: "ecommerce-checkout",
    name: "Global E-Commerce Checkout",
    prompt:
      "Design a high-consistency checkout and inventory reservation system for flash sales with idempotent payment processing, zero overselling, and asynchronous order fulfillment.",
    nodes: [
      { id: "ec-client", type: "client", label: "Storefront Client", x: 32, y: 220 },
      { id: "ec-lb", type: "load-balancer", label: "Global Load Balancer", x: 230, y: 220 },
      { id: "ec-order", type: "service", label: "Checkout Service", x: 438, y: 140 },
      { id: "ec-inv", type: "service", label: "Inventory Service", x: 438, y: 300 },
      { id: "ec-cache", type: "cache", label: "Redis Locks & Cart", x: 656, y: 110 },
      { id: "ec-db", type: "database", label: "PostgreSQL Ledger", x: 656, y: 230 },
      { id: "ec-q", type: "queue", label: "Fulfillment Queue", x: 656, y: 350 },
    ],
    edges: [
      { id: "ee-1", from: "ec-client", to: "ec-lb", label: "HTTPS" },
      { id: "ee-2", from: "ec-lb", to: "ec-order", label: "POST /checkout" },
      { id: "ee-3", from: "ec-order", to: "ec-inv", label: "Reserve stock" },
      { id: "ee-4", from: "ec-order", to: "ec-cache", label: "Idempotency" },
      { id: "ee-5", from: "ec-order", to: "ec-db", label: "ACID tx" },
      { id: "ee-6", from: "ec-inv", to: "ec-db", label: "Row lock" },
      { id: "ee-7", from: "ec-order", to: "ec-q", label: "OrderPaid" },
    ],
  },
  {
    id: "blank",
    name: "Blank Canvas",
    prompt:
      "Design a scalable distributed backend for your target system. Add components from the palette and connect request paths.",
    nodes: [],
    edges: [],
  },
];

function getAnchorPoints(source: CanvasNode, target: CanvasNode) {
  const sx = source.x + NODE_WIDTH / 2;
  const sy = source.y + NODE_HEIGHT / 2;
  const tx = target.x + NODE_WIDTH / 2;
  const ty = target.y + NODE_HEIGHT / 2;

  const dx = tx - sx;
  const dy = ty - sy;

  let startX = sx;
  let startY = sy;
  let endX = tx;
  let endY = ty;

  if (Math.abs(dx) >= Math.abs(dy)) {
    startX = dx >= 0 ? source.x + NODE_WIDTH : source.x;
    endX = dx >= 0 ? target.x : target.x + NODE_WIDTH;
  } else {
    startY = dy >= 0 ? source.y + NODE_HEIGHT : source.y;
    endY = dy >= 0 ? target.y : target.y + NODE_HEIGHT;
  }

  return { startX, startY, endX, endY };
}

export default function SystemDesignPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [activeScenarioId, setActiveScenarioId] = useState<string>(
    SCENARIOS[0].id,
  );
  const [prompt, setPrompt] = useState<string>(SCENARIOS[0].prompt);
  const [nodes, setNodes] = useState<CanvasNode[]>(SCENARIOS[0].nodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(SCENARIOS[0].edges);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    SCENARIOS[0].nodes[0]?.id ?? null,
  );
  const [connectMode, setConnectMode] = useState(false);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const [edgeLabelDraft, setEdgeLabelDraft] = useState("");

  const [critique, setCritique] = useState<CritiqueResponse | null>(null);
  const [critiqueLoading, setCritiqueLoading] = useState(false);
  const [critiqueError, setCritiqueError] = useState<string | null>(null);
  const [linkedApp, setLinkedApp] = useState<LinkedApplicationContext | null>(
    null,
  );
  const [applicationsList, setApplicationsList] = useState<
    { id: string; company: string; role: string; jobDescription: string }[]
  >([]);
  const [savedSessions, setSavedSessions] = useState<SavedDesignSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [generatingDiagram, setGeneratingDiagram] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    nodeId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in?callbackUrl=/system-design");
    }
  }, [isPending, session, router]);

  // Load linked application context (?applicationId=...) and saved sessions from Prisma,
  // auto-hydrating the canvas with the role's saved architecture if one exists!
  useEffect(() => {
    if (!session) return;
    let active = true;

    const params = new URLSearchParams(window.location.search);
    const appId = params.get("applicationId");

    (async () => {
      try {
        const [appJson, sessionsJson, allAppsJson] = await Promise.all([
          appId
            ? fetch(`/api/applications/${appId}`, { cache: "no-store" }).then(
                (r) => (r.ok ? r.json() : null),
              )
            : Promise.resolve(null),
          fetch("/api/system-design", { cache: "no-store" }).then((r) =>
            r.ok ? r.json() : null,
          ),
          fetch("/api/applications", { cache: "no-store" }).then((r) =>
            r.ok ? r.json() : null,
          ),
        ]);

        if (!active) return;

        if (Array.isArray(allAppsJson?.applications)) {
          setApplicationsList(allAppsJson.applications);
        }

        const allSessions: SavedDesignSession[] = Array.isArray(
          sessionsJson?.sessions,
        )
          ? (sessionsJson.sessions as SavedDesignSession[])
          : [];
        setSavedSessions(allSessions);

        const app = appJson?.application as
          | {
              id: string;
              company: string;
              role: string;
              jobDescription?: string;
            }
          | undefined;

        if (app) {
          setLinkedApp({ id: app.id, company: app.company, role: app.role });
          const matchingSession = allSessions.find(
            (s) => s.applicationId === app.id,
          );
          if (matchingSession && Array.isArray(matchingSession.nodes)) {
            setActiveScenarioId("custom");
            setActiveSessionId(matchingSession.id);
            setPrompt(matchingSession.prompt);
            setNodes(matchingSession.nodes);
            setEdges(
              Array.isArray(matchingSession.edges) ? matchingSession.edges : [],
            );
            setCritique(matchingSession.critique ?? null);
            setSelectedNodeId(matchingSession.nodes[0]?.id ?? null);
          } else {
            setActiveSessionId(null);
            const jdSnippet = app.jobDescription?.trim()
              ? ` Key requirements: ${app.jobDescription.trim().slice(0, 260)}`
              : "";
            setPrompt(
              `Design a scalable architecture for the ${app.role} interview loop at ${app.company}.${jdSnippet}`,
            );
          }
        }
      } catch {
        // Non-blocking initial load
      }
    })();

    return () => {
      active = false;
    };
  }, [session]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const nodeById = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes],
  );

  const handleSelectScenario = (scenario: ScenarioPreset) => {
    setActiveScenarioId(scenario.id);
    setPrompt(scenario.prompt);
    setNodes(scenario.nodes.map((n) => ({ ...n })));
    setEdges(scenario.edges.map((e) => ({ ...e })));
    setSelectedNodeId(scenario.nodes[0]?.id ?? null);
    setConnectMode(false);
    setConnectSourceId(null);
    setCritique(null);
    setCritiqueError(null);
  };

  const handleAddNode = (type: NodeTypeId) => {
    const meta = PALETTE_MAP.get(type);
    const count = nodes.filter((n) => n.type === type).length + 1;
    const baseLabel = meta?.label ?? "Component";
    const label = count > 1 ? `${baseLabel} ${count}` : baseLabel;

    const index = nodes.length;
    const col = index % 4;
    const row = Math.floor(index / 4) % 4;
    const x = Math.min(CANVAS_WIDTH - NODE_WIDTH - 24, 40 + col * 195);
    const y = Math.min(CANVAS_HEIGHT - NODE_HEIGHT - 24, 48 + row * 112);

    const newNode: CanvasNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      label,
      x,
      y,
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) =>
      prev.filter((e) => e.from !== nodeId && e.to !== nodeId),
    );
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    if (connectSourceId === nodeId) setConnectSourceId(null);
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
  };

  const handleNodeClick = (nodeId: string) => {
    if (!connectMode) {
      setSelectedNodeId(nodeId);
      return;
    }

    if (!connectSourceId) {
      setConnectSourceId(nodeId);
      setSelectedNodeId(nodeId);
      return;
    }

    if (connectSourceId === nodeId) {
      setConnectSourceId(null);
      return;
    }

    const exists = edges.some(
      (e) => e.from === connectSourceId && e.to === nodeId,
    );
    if (!exists) {
      const trimmedLabel = edgeLabelDraft.trim();
      setEdges((prev) => [
        ...prev,
        {
          id: `edge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          from: connectSourceId,
          to: nodeId,
          ...(trimmedLabel ? { label: trimmedLabel } : {}),
        },
      ]);
    }
    setConnectSourceId(null);
    setEdgeLabelDraft("");
  };

  const handlePointerDownNode = (
    e: React.PointerEvent<HTMLDivElement>,
    node: CanvasNode,
  ) => {
    if (connectMode) {
      e.stopPropagation();
      handleNodeClick(node.id);
      return;
    }

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const pointerX = e.clientX - canvasRect.left;
    const pointerY = e.clientY - canvasRect.top;

    dragStateRef.current = {
      nodeId: node.id,
      offsetX: pointerX - node.x,
      offsetY: pointerY - node.y,
    };

    setSelectedNodeId(node.id);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMoveNode = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const rawX = e.clientX - canvasRect.left - drag.offsetX;
    const rawY = e.clientY - canvasRect.top - drag.offsetY;

    const clampedX = Math.max(
      12,
      Math.min(canvasRect.width - NODE_WIDTH - 12, rawX),
    );
    const clampedY = Math.max(
      12,
      Math.min(canvasRect.height - NODE_HEIGHT - 12, rawY),
    );

    setNodes((prev) =>
      prev.map((n) =>
        n.id === drag.nodeId
          ? { ...n, x: Math.round(clampedX), y: Math.round(clampedY) }
          : n,
      ),
    );
  };

  const handlePointerUpNode = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current) {
      dragStateRef.current = null;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }
  };

  const handleExportJson = () => {
    const payload = {
      scenario: activeScenarioId,
      prompt,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `system-design-${activeScenarioId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const persistSession = async (critiqueResult?: CritiqueResponse | null) => {
    setSavingSession(true);
    setSaveNotice(null);
    try {
      const scenarioMeta = SCENARIOS.find((s) => s.id === activeScenarioId);
      const sessionTitle = linkedApp
        ? `${linkedApp.company} — ${linkedApp.role}`
        : scenarioMeta?.name || "Custom Architecture";

      const res = await fetch("/api/system-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeSessionId ?? undefined,
          title: sessionTitle,
          prompt: prompt.trim() || "Distributed system architecture review",
          nodes,
          edges,
          score: critiqueResult?.score ?? critique?.score ?? undefined,
          critique: critiqueResult ?? critique ?? undefined,
          applicationId: linkedApp?.id,
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as { session?: SavedDesignSession };
        if (json.session) {
          setActiveSessionId(json.session.id);
          setSavedSessions((prev) => [
            json.session!,
            ...prev.filter((item) => item.id !== json.session!.id),
          ].slice(0, 12));
          setSaveNotice(
            activeSessionId ? "Updated in PostgreSQL" : "Saved to PostgreSQL",
          );
          window.setTimeout(() => setSaveNotice(null), 2500);
        }
      }
    } catch {
      // Non-blocking save
    } finally {
      setSavingSession(false);
    }
  };

  const handleGenerateFromPrompt = async () => {
    if (!prompt.trim()) return;
    setGeneratingDiagram(true);
    setCritiqueError(null);
    try {
      const res = await fetch("/api/ai/generate-architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          role: linkedApp?.role,
          company: linkedApp?.company,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Could not generate diagram");
      }
      if (Array.isArray(json.nodes) && json.nodes.length > 0) {
        setActiveScenarioId("custom");
        setNodes(json.nodes as CanvasNode[]);
        setEdges(Array.isArray(json.edges) ? (json.edges as CanvasEdge[]) : []);
        setSelectedNodeId(json.nodes[0]?.id ?? null);
        setCritique(null);
        setSaveNotice("Diagram generated — click Save or Run AI Critique");
        window.setTimeout(() => setSaveNotice(null), 3500);
      }
    } catch (error) {
      setCritiqueError(
        error instanceof Error
          ? error.message
          : "Failed to generate architecture from prompt",
      );
    } finally {
      setGeneratingDiagram(false);
    }
  };

  const handleSwitchRole = (nextAppId: string) => {
    if (!nextAppId) {
      setLinkedApp(null);
      setActiveSessionId(null);
      return;
    }
    const found = applicationsList.find((a) => a.id === nextAppId);
    if (!found) return;
    setLinkedApp({ id: found.id, company: found.company, role: found.role });
    const existing = savedSessions.find((s) => s.applicationId === found.id);
    if (existing && Array.isArray(existing.nodes)) {
      setActiveScenarioId("custom");
      setActiveSessionId(existing.id);
      setPrompt(existing.prompt);
      setNodes(existing.nodes);
      setEdges(Array.isArray(existing.edges) ? existing.edges : []);
      setCritique(existing.critique ?? null);
      setSelectedNodeId(existing.nodes[0]?.id ?? null);
    } else {
      setActiveSessionId(null);
      setCritique(null);
      const jdSnippet = found.jobDescription?.trim()
        ? ` Key requirements: ${found.jobDescription.trim().slice(0, 260)}`
        : "";
      setPrompt(
        `Design a scalable architecture for the ${found.role} interview loop at ${found.company}.${jdSnippet}`,
      );
    }
  };

  const handleDeleteSavedSession = async (sessionId: string) => {
    setSavedSessions((prev) => prev.filter((item) => item.id !== sessionId));
    if (activeSessionId === sessionId) setActiveSessionId(null);
    await fetch(`/api/system-design?id=${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
    }).catch(() => {});
  };

  const handleRunCritique = async () => {
    setCritiqueLoading(true);
    setCritiqueError(null);

    try {
      const response = await fetch("/api/ai/critique-architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim() || "Distributed system architecture review",
          nodes: nodes.map(({ id, type, label }) => ({ id, type, label })),
          edges: edges.map(({ from, to, label }) => ({
            from,
            to,
            ...(label ? { label } : {}),
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to evaluate architecture");
      }

      const result = data as CritiqueResponse;
      setCritique(result);
      void persistSession(result);
    } catch (error) {
      setCritiqueError(
        error instanceof Error
          ? error.message
          : "Unable to run architecture critique",
      );
    } finally {
      setCritiqueLoading(false);
    }
  };

  if (isPending || !session) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
        <Skeleton className="h-12 w-80" />
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="h-[540px] rounded-xl lg:col-span-8" />
          <Skeleton className="h-[540px] rounded-xl lg:col-span-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            System Design Studio
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sketch distributed architectures, connect data flows, and run an
            instant staff-level architecture critique.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {saveNotice && (
            <span className="text-xs font-medium text-primary">
              {saveNotice}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void persistSession()}
            disabled={savingSession}
            className="gap-1.5"
          >
            {savingSession ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            className="gap-1.5"
          >
            <Download className="size-3.5" />
            Export JSON
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleRunCritique}
            disabled={critiqueLoading}
            className="gap-1.5"
          >
            {critiqueLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            Run AI Critique
          </Button>
        </div>
      </div>

      {/* Linked Application Context */}
      {linkedApp && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2">
            <Briefcase className="size-4 text-primary" />
            <span className="text-foreground">
              Preparing system design for{" "}
              <strong className="font-semibold">{linkedApp.role}</strong> at{" "}
              <strong className="font-semibold">{linkedApp.company}</strong>
            </span>
          </div>
          <Link
            href="/applications"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Back to Applications
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* Scenario Switcher + Prompt */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-5">
          <Label>Preset scenarios</Label>
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map((scenario) => {
              const active = scenario.id === activeScenarioId;
              return (
                <Button
                  key={scenario.id}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() => handleSelectScenario(scenario)}
                >
                  {scenario.name}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="architecture-prompt">System design prompt</Label>
            <div className="flex items-center gap-2">
              {applicationsList.length > 0 && (
                <select
                  aria-label="Link to target role"
                  value={linkedApp?.id ?? ""}
                  onChange={(e) => handleSwitchRole(e.target.value)}
                  className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground"
                >
                  <option value="">Standalone canvas</option>
                  {applicationsList.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.company} · {app.role}
                    </option>
                  ))}
                </select>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleGenerateFromPrompt()}
                disabled={generatingDiagram || prompt.trim().length < 5}
                className="h-7 gap-1.5 px-2.5 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
              >
                {generatingDiagram ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Wand2 className="size-3" />
                    Generate diagram
                  </>
                )}
              </Button>
            </div>
          </div>
          <Textarea
            id="architecture-prompt"
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe scale targets, latency SLAs, and core functional requirements…"
          />
        </div>
      </div>

      {/* Main Studio Workspace */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Palette + Interactive Canvas */}
        <div className="space-y-4 lg:col-span-8">
          {/* Component Palette & Mode Controls */}
          <Card className="shadow-none">
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground">
                  Component palette — click to add
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={connectMode ? "default" : "outline"}
                    onClick={() => {
                      setConnectMode((prev) => !prev);
                      setConnectSourceId(null);
                    }}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Link2 className="size-3.5" />
                    {connectMode ? "Connecting…" : "Connect"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNodes([]);
                      setEdges([]);
                      setSelectedNodeId(null);
                      setConnectSourceId(null);
                    }}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <RotateCcw className="size-3.5" />
                    Clear
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {PALETTE.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => handleAddNode(item.type)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground"
                    >
                      <Icon className="size-3.5 text-primary" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {connectMode && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-accent/50 px-3 py-2 text-xs text-foreground">
                  <span className="font-medium">
                    {connectSourceId
                      ? `Select target component to connect from "${nodeById.get(connectSourceId)?.label ?? "node"}"`
                      : "Click a source component, then click a target component to draw a directional edge."}
                  </span>
                  <Input
                    value={edgeLabelDraft}
                    onChange={(e) => setEdgeLabelDraft(e.target.value)}
                    placeholder="Optional edge label (e.g. gRPC, Read)"
                    className="h-7 w-56 bg-background text-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interactive SVG + HTML Node Canvas */}
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <div
              ref={canvasRef}
              className="relative min-w-[780px] select-none bg-[radial-gradient(circle,_var(--border)_1px,_transparent_1px)] [background-size:20px_20px]"
              style={{ height: CANVAS_HEIGHT }}
              onClick={() => {
                if (!connectMode) setSelectedNodeId(null);
              }}
            >
              {/* Directional Edges Layer */}
              <svg
                className="pointer-events-none absolute inset-0 size-full"
                aria-label="Architecture connections"
              >
                <defs>
                  <marker
                    id="arrow-head"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" className="fill-primary" />
                  </marker>
                </defs>

                {edges.map((edge) => {
                  const source = nodeById.get(edge.from);
                  const target = nodeById.get(edge.to);
                  if (!source || !target) return null;

                  const { startX, startY, endX, endY } = getAnchorPoints(
                    source,
                    target,
                  );
                  const midX = (startX + endX) / 2;
                  const midY = (startY + endY) / 2;
                  const ctrlX = startX + (endX - startX) * 0.5;
                  const pathD = `M ${startX} ${startY} Q ${ctrlX} ${startY}, ${midX} ${midY} T ${endX} ${endY}`;

                  return (
                    <g key={edge.id}>
                      <path
                        d={pathD}
                        fill="none"
                        strokeWidth={2}
                        className="stroke-primary/70"
                        markerEnd="url(#arrow-head)"
                      />
                      {edge.label && (
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x={-36}
                            y={-10}
                            width={72}
                            height={20}
                            rx={6}
                            className="fill-background stroke-border"
                          />
                          <text
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="fill-muted-foreground text-[10px] font-medium"
                          >
                            {edge.label.length > 13
                              ? `${edge.label.slice(0, 12)}…`
                              : edge.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Draggable Nodes Layer */}
              {nodes.map((node) => {
                const meta = PALETTE_MAP.get(node.type);
                const Icon = meta?.icon ?? Server;
                const isSelected = selectedNodeId === node.id;
                const isConnectSource = connectSourceId === node.id;

                return (
                  <div
                    key={node.id}
                    role="button"
                    tabIndex={0}
                    onPointerDown={(e) => handlePointerDownNode(e, node)}
                    onPointerMove={handlePointerMoveNode}
                    onPointerUp={handlePointerUpNode}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleNodeClick(node.id);
                      }
                    }}
                    style={{
                      left: node.x,
                      top: node.y,
                      width: NODE_WIDTH,
                      height: NODE_HEIGHT,
                    }}
                    className={cn(
                      "absolute flex touch-none items-center gap-2.5 rounded-xl border bg-card px-3 py-2 shadow-xs transition-colors",
                      connectMode
                        ? "cursor-crosshair"
                        : "cursor-grab active:cursor-grabbing",
                      isConnectSource
                        ? "border-primary bg-accent ring-2 ring-primary/35"
                        : isSelected
                          ? "border-primary ring-1 ring-primary/30"
                          : "border-border hover:border-foreground/40",
                    )}
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {node.label}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {meta?.shortLabel ?? node.type}
                      </p>
                    </div>
                  </div>
                );
              })}

              {nodes.length === 0 && (
                <div className="pointer-events-none flex h-full flex-col items-center justify-center p-6 text-center">
                  <Cpu className="size-6 text-primary" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    Blank architecture canvas
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Click components in the palette above to place them, drag to
                    arrange, and use Connect to trace request paths.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Node & Connections Inspector */}
          <Card className="shadow-none">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
              {selectedNode ? (
                <>
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="selected-node-label">
                      Selected component ({PALETTE_MAP.get(selectedNode.type)?.label})
                    </Label>
                    <Input
                      id="selected-node-label"
                      value={selectedNode.label}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, label: value }
                              : n,
                          ),
                        );
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setConnectMode(true);
                        setConnectSourceId(selectedNode.id);
                      }}
                      className="gap-1.5"
                    >
                      <Link2 className="size-3.5" />
                      Connect from here
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteNode(selectedNode.id)}
                      className="gap-1.5"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Select any component on the canvas to rename or remove it.{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {nodes.length} nodes · {edges.length} edges
                  </span>
                </p>
              )}
            </CardContent>

            {edges.length > 0 && (
              <div className="border-t border-border px-4 py-3">
                <p className="mb-2 text-xs font-semibold text-foreground">
                  Active connections ({edges.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {edges.map((edge) => {
                    const fromLabel = nodeById.get(edge.from)?.label ?? edge.from;
                    const toLabel = nodeById.get(edge.to)?.label ?? edge.to;
                    return (
                      <Badge
                        key={edge.id}
                        variant="secondary"
                        className="gap-1.5 pr-1.5 text-[11px] font-normal"
                      >
                        <span className="max-w-[100px] truncate">{fromLabel}</span>
                        <ArrowRight className="size-3 text-primary" />
                        <span className="max-w-[100px] truncate">{toLabel}</span>
                        {edge.label && (
                          <span className="text-muted-foreground">
                            ({edge.label})
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteEdge(edge.id)}
                          aria-label={`Remove edge from ${fromLabel} to ${toLabel}`}
                          className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-destructive"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Architecture Critique Panel */}
        <div className="lg:col-span-4">
          <Card className="h-full shadow-none">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="font-display text-xl">
                  Architecture Critique
                </CardTitle>
                {critique && (
                  <Badge variant="outline" className="text-[11px]">
                    {critique.source === "ai" ? "AI Review" : "Heuristic Review"}
                  </Badge>
                )}
              </div>
              <CardDescription>
                Evaluates scalability, single points of failure, caching, and
                async boundaries.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-5">
              {critiqueError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  {critiqueError}
                </div>
              )}

              {critiqueLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              ) : critique ? (
                <>
                  {/* Score Summary */}
                  <div className="rounded-xl border border-border bg-muted/35 p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Design Readiness Score
                      </span>
                      <span className="font-display text-3xl font-bold text-primary tabular-nums">
                        {critique.score}
                        <span className="text-sm font-medium text-muted-foreground">
                          /100
                        </span>
                      </span>
                    </div>
                    <Progress value={critique.score} className="mt-2.5 h-2" />
                    <p className="mt-3 text-xs leading-relaxed text-foreground">
                      {critique.summary}
                    </p>
                  </div>

                  {/* Strengths */}
                  <div className="space-y-2">
                    <h2 className="flex items-center gap-1.5 font-display text-sm font-semibold text-foreground">
                      <CheckCircle2 className="size-4 text-primary" />
                      Strengths
                    </h2>
                    <ul className="space-y-2">
                      {critique.strengths.map((item) => (
                        <li
                          key={item}
                          className="rounded-lg border border-border bg-background p-2.5 text-xs leading-relaxed text-foreground"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottlenecks */}
                  <div className="space-y-2">
                    <h2 className="flex items-center gap-1.5 font-display text-sm font-semibold text-foreground">
                      <AlertTriangle className="size-4 text-destructive" />
                      Bottlenecks &amp; Risks
                    </h2>
                    {critique.bottlenecks.length > 0 ? (
                      <ul className="space-y-2">
                        {critique.bottlenecks.map((item) => (
                          <li
                            key={item}
                            className="rounded-lg border border-border bg-background p-2.5 text-xs leading-relaxed text-foreground"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No critical structural bottlenecks flagged.
                      </p>
                    )}
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <h2 className="flex items-center gap-1.5 font-display text-sm font-semibold text-foreground">
                      <Lightbulb className="size-4 text-primary" />
                      Recommendations
                    </h2>
                    <ul className="space-y-2">
                      {critique.recommendations.map((item) => (
                        <li
                          key={item}
                          className="rounded-lg border border-border bg-background p-2.5 text-xs leading-relaxed text-foreground"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center">
                  <Cpu className="size-6 text-primary" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    Ready to review your design
                  </p>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                    Arrange components and directional edges on the whiteboard,
                    then click Run AI Critique for a structured staff-engineer
                    assessment.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleRunCritique}
                    className="mt-4 gap-1.5"
                  >
                    <Play className="size-3.5" />
                    Run AI Critique
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Saved Sessions History (Persisted in PostgreSQL) */}
      {savedSessions.length > 0 && (
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <History className="size-4 text-primary" />
                <CardTitle className="font-display text-lg">
                  Saved Architecture Sessions
                </CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs tabular-nums">
                {savedSessions.length} saved
              </Badge>
            </div>
            <CardDescription>
              Click any previous session to reload its nodes, edges, and critique.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {savedSessions.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group flex flex-col justify-between gap-2 rounded-xl border bg-background p-3.5 transition-colors",
                    activeSessionId === item.id
                      ? "border-primary ring-1 ring-primary/25"
                      : "border-border hover:border-primary/40 hover:bg-muted/40",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveScenarioId("custom");
                      setActiveSessionId(item.id);
                      setPrompt(item.prompt);
                      if (Array.isArray(item.nodes)) setNodes(item.nodes);
                      if (Array.isArray(item.edges)) setEdges(item.edges);
                      setCritique(item.critique ?? null);
                      setSelectedNodeId(item.nodes?.[0]?.id ?? null);
                    }}
                    className="flex w-full flex-col items-start gap-1.5 text-left"
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {item.title}
                      </span>
                      {typeof item.score === "number" && (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-primary/30 bg-primary/10 text-xs text-primary tabular-nums"
                        >
                          {item.score}/100
                        </Badge>
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {item.prompt}
                    </p>
                  </button>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground tabular-nums">
                    <span>
                      {Array.isArray(item.nodes) ? item.nodes.length : 0} nodes ·{" "}
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleDeleteSavedSession(item.id)}
                      aria-label={`Delete ${item.title}`}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
