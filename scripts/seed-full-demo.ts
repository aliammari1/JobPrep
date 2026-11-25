/**
 * Full-app realistic demo seeder for JobPrep.
 *
 * Populates PostgreSQL for `admin@jobprep.local` with deeply interconnected
 * JobApplications, CVs, CoverLetters, AIMockSessions (+ MockQuestions),
 * SystemDesignSessions, InterviewTemplates (+ Questions + Interviews),
 * Challenges (+ CodeSubmissions), and CandidateProfile.
 *
 * Safe to re-run: clears previous data for the demo admin user first.
 *
 * Usage:
 *   bun scripts/seed-full-demo.ts
 */
import prisma from "../src/lib/prisma";

const DEMO_EMAIL = "admin@jobprep.local";

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (!user) {
    throw new Error(
      `User ${DEMO_EMAIL} not found. Run 'bun scripts/seed-demo-admin.ts' first while the dev server is running.`,
    );
  }

  console.log(
    `Seeding full interconnected dataset for ${user.email} (${user.id})...`,
  );

  // Upgrade demo account to active Pro so all workspaces are unlocked
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: "Alex Mercer",
      emailVerified: true,
      role: "admin",
      subscriptionTier: "YEARLY",
      subscriptionStatus: "ACTIVE",
      currentPeriodEnd: daysFromNow(365),
    },
  });

  // Clean existing user-owned records for idempotency
  await prisma.$transaction([
    prisma.systemDesignSession.deleteMany({ where: { userId: user.id } }),
    prisma.aIMockSession.deleteMany({ where: { userId: user.id } }),
    prisma.interview.deleteMany({ where: { candidateId: user.id } }),
    prisma.interviewTemplate.deleteMany({ where: { createdBy: user.id } }),
    prisma.codeSubmission.deleteMany({ where: { userId: user.id } }),
    prisma.codeDraft.deleteMany({ where: { userId: user.id } }),
    prisma.challenge.deleteMany({ where: { userId: user.id } }),
    prisma.coverLetter.deleteMany({ where: { userId: user.id } }),
    prisma.cV.deleteMany({ where: { userId: user.id } }),
    prisma.jobApplication.deleteMany({ where: { userId: user.id } }),
    prisma.candidateProfile.deleteMany({ where: { userId: user.id } }),
  ]);

  // 1. Candidate Profile
  await prisma.candidateProfile.create({
    data: {
      userId: user.id,
      jobTitle: "Senior Full-Stack & Distributed Systems Engineer",
      location: "Lisbon / Remote (EU & US Overlap)",
      remote: true,
      expectedSalary: "$210k–$260k",
      linkedIn: "https://linkedin.com/in/alex-mercer-eng",
      github: "https://github.com/alexmercer-dev",
      portfolio: "https://alexmercer.dev",
      skills: [
        "TypeScript",
        "Next.js",
        "React",
        "Node.js",
        "PostgreSQL",
        "Prisma",
        "Redis",
        "Kafka",
        "Go",
        "Cloudflare Workers",
        "Docker",
        "Kubernetes",
        "Distributed Systems",
        "System Design",
      ],
      certifications: [
        "AWS Solutions Architect Associate",
        "CKAD (Kubernetes Application Developer)",
      ],
      careerGoals:
        "Lead high-throughput developer infrastructure or real-time collaborative product architecture at a high-craft engineering organization.",
    },
  });

  // 2. Job Applications (8 realistic roles across all 5 stages)
  const appsInput = [
    {
      company: "Linear",
      role: "Product Engineer — Sync Engine",
      location: "Remote (EU / US)",
      salaryRange: "$200k–$235k + equity",
      jobUrl: "https://linear.app/careers",
      stage: "offer",
      atsScore: 92,
      notes:
        "Final exec chat went great. Karri and Tuomas loved the local-first IndexedDB delta sync demo. Reviewing offer equity breakdown this week.",
      jobDescription:
        "Build and scale Linear's local-first sync engine in TypeScript, React, IndexedDB, WebSockets, and PostgreSQL. Optimize optimistic mutations, conflict resolution, sub-50ms UI interactions, and offline resilience for hundreds of thousands of concurrent engineering teams.",
      updatedAt: daysAgo(1),
    },
    {
      company: "Stripe",
      role: "Staff Backend Engineer — Payments Ledger",
      location: "San Francisco / Remote",
      salaryRange: "$245k–$290k",
      jobUrl: "https://stripe.com/jobs",
      stage: "onsite",
      atsScore: 88,
      notes:
        "Virtual onsite scheduled: Architecture round (idempotent ledger design) + Debugging round + Hiring Manager behavioral loop.",
      jobDescription:
        "Design and operate globally distributed payment ledger services using Go, TypeScript, PostgreSQL, Redis, Kafka, and idempotency keys. Guarantee double-entry consistency, zero double-charging under retries, strict p99 latency SLAs, and multi-region failover.",
      updatedAt: daysAgo(2),
    },
    {
      company: "Cloudflare",
      role: "Senior Systems Engineer — Workers Runtime",
      location: "Lisbon / Hybrid",
      salaryRange: "$210k–$250k",
      jobUrl: "https://www.cloudflare.com/careers/",
      stage: "onsite",
      atsScore: 84,
      notes:
        "Passed technical screen with strong feedback on V8 isolate cold-start analysis and R2 caching tiers.",
      jobDescription:
        "Work on Cloudflare Workers, Hyperdrive, R2 object storage, and edge routing infrastructure. Deep experience with TypeScript, Rust or Go, distributed caching, HTTP/3, WebSockets, observability, and high-throughput edge telemetry.",
      updatedAt: daysAgo(3),
    },
    {
      company: "Vercel",
      role: "Senior Full-Stack Engineer — Next.js DX",
      location: "Remote",
      salaryRange: "$195k–$230k",
      jobUrl: "https://vercel.com/careers",
      stage: "screening",
      atsScore: 81,
      notes:
        "Recruiter screen cleared. Technical pair-programming session on React Server Components and streaming SSR next Tuesday.",
      jobDescription:
        "Shape the developer experience of Next.js App Router, React 19, TypeScript, Turbopack, and Edge Middleware. Build production tooling, CI/CD pipelines, telemetry dashboards, and zero-config deployment workflows.",
      updatedAt: daysAgo(5),
    },
    {
      company: "Datadog",
      role: "Distributed Systems Engineer — Telemetry",
      location: "Paris / Hybrid",
      salaryRange: "$205k–$240k",
      jobUrl: "https://careers.datadoghq.com/",
      stage: "screening",
      atsScore: 76,
      notes:
        "HM intro complete. Need to brush up on Kafka partitioning, backpressure, and time-series compression.",
      jobDescription:
        "Build high-volume telemetry ingestion pipelines processing millions of spans and metrics per second with Go, Kafka, Kubernetes, PostgreSQL, Redis, and OpenTelemetry.",
      updatedAt: daysAgo(7),
    },
    {
      company: "Anthropic",
      role: "Full-Stack Infrastructure Engineer",
      location: "San Francisco, CA",
      salaryRange: "$260k–$320k",
      jobUrl: "https://www.anthropic.com/careers",
      stage: "applied",
      atsScore: 79,
      notes:
        "Applied via referral from Maya (Infra team). Highlighted streaming LLM orchestration, rate limiting, and Sentry observability.",
      jobDescription:
        "Build reliable web platforms, API gateways, evaluation pipelines, and real-time streaming interfaces in TypeScript, React, Next.js, Python, and PostgreSQL for large-scale AI systems.",
      updatedAt: daysAgo(9),
    },
    {
      company: "Figma",
      role: "Senior Frontend Infrastructure Engineer",
      location: "New York / Remote",
      salaryRange: "$215k–$255k",
      jobUrl: "https://www.figma.com/careers/",
      stage: "applied",
      atsScore: 73,
      notes:
        "Submitted tailored CV emphasizing Core Web Vitals and canvas rendering.",
      jobDescription:
        "Lead frontend architecture, WebGL/Canvas performance, TypeScript build tooling, design system foundations, accessibility (WCAG), and Core Web Vitals optimization across Figma web surfaces.",
      updatedAt: daysAgo(12),
    },
    {
      company: "Supabase",
      role: "Postgres Platform Engineer",
      location: "Remote",
      salaryRange: "$185k–$220k",
      jobUrl: "https://supabase.com/careers",
      stage: "saved",
      atsScore: 68,
      notes:
        "Interesting open-source role — tailor CV to emphasize Postgres connection pooling and Prisma migrations before applying.",
      jobDescription:
        "Maintain and scale managed PostgreSQL fleets, PgBouncer connection pooling, Row Level Security, edge functions, TypeScript SDKs, and developer dashboard workflows.",
      updatedAt: daysAgo(15),
    },
  ];

  const createdApps = [];
  for (const app of appsInput) {
    const created = await prisma.jobApplication.create({
      data: {
        userId: user.id,
        ...app,
        createdAt: daysAgo(20),
      },
    });
    createdApps.push(created);
  }

  const [
    linearApp,
    stripeApp,
    cloudflareApp,
    vercelApp,
    datadogApp,
    anthropicApp,
  ] = createdApps;

  // 3. Tailored CVs linked to JobApplications
  const baseCvPayload = (targetTitle: string, summary: string) =>
    JSON.stringify({
      cvData: {
        personalInfo: {
          fullName: "Alex Mercer",
          title: targetTitle,
          email: "alex@mercer.dev",
          phone: "+351 912 345 678",
          location: "Lisbon, Portugal (Remote)",
          summary,
        },
        experience: [
          {
            id: "exp-1",
            title: "Senior Software Engineer",
            company: "Northstar Cloud",
            location: "Remote",
            startDate: "2023-02",
            endDate: "Present",
            current: true,
            description: [
              "Architected a multi-region PostgreSQL + Redis event ingestion pipeline handling 48,000 req/s at 24ms p99 latency.",
              "Cut Next.js App Router TTFB by 62% by migrating hot read paths to Cloudflare Workers and R2 edge caching.",
              "Led TypeScript SDK and idempotent webhook processing, reducing duplicate billing incidents by 99.4%.",
            ],
          },
          {
            id: "exp-2",
            title: "Full-Stack Engineer",
            company: "Pulse Labs",
            location: "London, UK",
            startDate: "2020-06",
            endDate: "2023-01",
            current: false,
            description: [
              "Built a local-first collaborative canvas in React, TypeScript, and WebSockets serving 140k monthly active users.",
              "Introduced automated Playwright E2E checks and Sentry tracing, cutting production regressions by 54%.",
            ],
          },
        ],
        skills: [
          {
            id: "sk-1",
            category: "Core Stack",
            items: [
              "TypeScript",
              "React",
              "Next.js",
              "Node.js",
              "Go",
              "PostgreSQL",
              "Prisma",
            ],
          },
          {
            id: "sk-2",
            category: "Infrastructure",
            items: [
              "Cloudflare Workers",
              "Redis",
              "Kafka",
              "Docker",
              "Kubernetes",
              "Sentry",
            ],
          },
        ],
        projects: [],
        education: [
          {
            id: "edu-1",
            degree: "B.Sc. Computer Science",
            institution: "Instituto Superior Técnico",
            startDate: "2016",
            endDate: "2020",
            description: "Distributed Systems & Compilers focus.",
          },
        ],
        certifications: [],
      },
    });

  await prisma.cV.createMany({
    data: [
      {
        userId: user.id,
        applicationId: linearApp.id,
        title: "Alex Mercer — Sync Engine & Local-First CV",
        content: baseCvPayload(
          "Product Engineer — Local-First & Sync Architecture",
          "Product-minded systems engineer focused on sub-50ms TypeScript UIs, IndexedDB delta sync, and resilient WebSocket engines.",
        ),
        createdAt: daysAgo(14),
      },
      {
        userId: user.id,
        applicationId: stripeApp.id,
        title: "Alex Mercer — Staff Payments Ledger CV",
        content: baseCvPayload(
          "Staff Backend Engineer — Distributed Ledgers & Reliability",
          "Backend architect specializing in idempotent payment APIs, PostgreSQL ACID ledgers, Kafka event streams, and multi-region failover.",
        ),
        createdAt: daysAgo(11),
      },
      {
        userId: user.id,
        applicationId: cloudflareApp.id,
        title: "Alex Mercer — Edge Runtime & Systems CV",
        content: baseCvPayload(
          "Senior Systems Engineer — Edge Compute & Storage",
          "Systems engineer building low-latency edge compute, R2 caching layers, and observable distributed runtimes.",
        ),
        createdAt: daysAgo(9),
      },
      {
        userId: user.id,
        applicationId: vercelApp.id,
        title: "Alex Mercer — Next.js DX & Platform CV",
        content: baseCvPayload(
          "Senior Full-Stack Engineer — Next.js & Developer Experience",
          "Full-stack engineer obsessed with React Server Components, streaming SSR, Core Web Vitals, and developer tooling.",
        ),
        createdAt: daysAgo(6),
      },
      {
        userId: user.id,
        applicationId: datadogApp.id,
        title: "Alex Mercer — High-Throughput Telemetry CV",
        content: baseCvPayload(
          "Distributed Systems Engineer — Observability & Pipelines",
          "Engineer building high-volume Go/Kafka ingestion pipelines and low-overhead telemetry instrumentation.",
        ),
        createdAt: daysAgo(5),
      },
      {
        userId: user.id,
        applicationId: anthropicApp.id,
        title: "Alex Mercer — AI Platform Infrastructure CV",
        content: baseCvPayload(
          "Full-Stack Infrastructure Engineer — Streaming AI Systems",
          "Engineer designing streaming LLM interfaces, rate-limited API gateways, and structured evaluation pipelines.",
        ),
        createdAt: daysAgo(3),
      },
    ],
  });

  // 4. Tailored Cover Letters linked to JobApplications
  await prisma.coverLetter.createMany({
    data: [
      {
        userId: user.id,
        applicationId: linearApp.id,
        title: "Linear — Product Engineer (Sync Engine)",
        jobTitle: linearApp.role,
        company: linearApp.company,
        content:
          "Dear Linear Engineering Team,\n\nI have spent the last four years building high-craft collaborative web software where latency is treated as a product bug. At Northstar Cloud and Pulse Labs, I architected optimistic mutation queues over WebSockets and IndexedDB that kept canvas interactions under 16ms even on flaky mobile connections.\n\nLinear's insistence on software speed and crisp interaction design aligns directly with how I build. I would love to contribute to the next generation of your sync engine.\n\nBest regards,\nAlex Mercer",
        createdAt: daysAgo(13),
      },
      {
        userId: user.id,
        applicationId: stripeApp.id,
        title: "Stripe — Staff Backend Engineer (Payments Ledger)",
        jobTitle: stripeApp.role,
        company: stripeApp.company,
        content:
          "Dear Stripe Payments Ledger Team,\n\nAt Northstar Cloud, I designed our idempotent webhook and ledger ingestion pipeline handling 48,000 requests/second on PostgreSQL and Redis—cutting duplicate billing incidents by 99.4% under network partitions.\n\nStripe's bar for correctness, API ergonomics, and operational rigor is unmatched. I am excited to bring my experience in double-entry consistency and multi-region failover to your ledger team.\n\nSincerely,\nAlex Mercer",
        createdAt: daysAgo(10),
      },
      {
        userId: user.id,
        applicationId: cloudflareApp.id,
        title: "Cloudflare — Senior Systems Engineer (Workers)",
        jobTitle: cloudflareApp.role,
        company: cloudflareApp.company,
        content:
          "Dear Cloudflare Workers Team,\n\nAfter migrating our hottest read paths to Cloudflare Workers and R2—cutting global TTFB by 62%—I became deeply interested in the runtime mechanics behind isolate scheduling and Hyperdrive connection pooling.\n\nI would be thrilled to help push edge compute performance and developer ergonomics forward from Lisbon.\n\nBest,\nAlex Mercer",
        createdAt: daysAgo(8),
      },
      {
        userId: user.id,
        applicationId: vercelApp.id,
        title: "Vercel — Senior Full-Stack Engineer (Next.js DX)",
        jobTitle: vercelApp.role,
        company: vercelApp.company,
        content:
          "Dear Vercel DX Team,\n\nI build production Next.js App Router applications daily and care deeply about turning complex streaming, caching, and TypeScript primitives into intuitive defaults.\n\nI would love to help make Next.js faster and clearer for millions of developers.\n\nBest,\nAlex Mercer",
        createdAt: daysAgo(5),
      },
      {
        userId: user.id,
        applicationId: anthropicApp.id,
        title: "Anthropic — Full-Stack Infrastructure Engineer",
        jobTitle: anthropicApp.role,
        company: anthropicApp.company,
        content:
          "Dear Anthropic Infrastructure Team,\n\nI specialize in resilient streaming web interfaces, structured evaluation harnesses, and observable API gateways in TypeScript and PostgreSQL. I am deeply motivated by Anthropic's mission and would love to help scale your developer and research infrastructure.\n\nSincerely,\nAlex Mercer",
        createdAt: daysAgo(3),
      },
    ],
  });

  // 5. AI Mock Interview Sessions + MockQuestions (spread across last 5 weeks!)
  const mockSeedData = [
    {
      applicationId: linearApp.id,
      sessionType: "technical",
      topics: ["Local-First Sync", "CRDTs", "IndexedDB", "React Performance"],
      duration: 38,
      overallScore: 93,
      daysAgo: 2,
      questions: [
        {
          text: "How would you design optimistic mutations with conflict resolution when a user edits an issue offline and reconnects 20 minutes later?",
          type: "technical",
          score: 9.4,
          answer:
            "Assign client-generated monotonic hybrid logical clocks (HLC) per field-level delta, persist pending mutations in an IndexedDB outbox, replay them in order over WebSocket on reconnect, and apply last-write-wins per attribute while surfacing structural conflicts cleanly.",
          ideal:
            "Use an IndexedDB mutation outbox with idempotent client mutation IDs, server-authoritative transaction sequence numbers, rebase local state on delta sync, and resolve per-field conflicts deterministically.",
        },
        {
          text: "Tell me about a time you diagnosed a subtle frame-drop or UI jank regression in production.",
          type: "behavioral",
          score: 9.2,
          answer:
            "At Pulse Labs, a 400-node board dropped to 18fps during drag operations. Profiling showed React context re-rendering every card on pointermove. I moved transient drag coordinates to refs + CSS transforms and batched store commits on pointerup, restoring steady 60fps.",
          ideal:
            "Concrete profiling methodology (Performance tab / flamegraph), root cause identification, measurable before/after FPS or INP improvement.",
        },
      ],
    },
    {
      applicationId: stripeApp.id,
      sessionType: "technical",
      topics: ["Idempotency", "PostgreSQL Isolation", "Distributed Ledgers"],
      duration: 45,
      overallScore: 89,
      daysAgo: 4,
      questions: [
        {
          text: "Walk through how you prevent double-charging when a client times out and retries a POST /charges request across two API nodes.",
          type: "technical",
          score: 9.0,
          answer:
            "Require an Idempotency-Key header scoped to the merchant. Acquire a unique constraint lock row in PostgreSQL (or atomic Redis SET NX with durable DB fallback) inside the same transaction boundary as the ledger debit, storing the serialized response so retries return the exact original outcome.",
          ideal:
            "Scoped idempotency key with unique DB index, atomic state machine (started -> succeeded/failed), payload hash mismatch detection (422), and safe recovery from mid-flight crashes.",
        },
        {
          text: "How do you handle hot-account lock contention in a double-entry PostgreSQL ledger?",
          type: "technical",
          score: 8.8,
          answer:
            "Split high-velocity platform accounts into N sub-ledgers (sharded balance rows) and aggregate on read, or append immutable ledger entries and compute balance snapshots asynchronously while enforcing overdraft limits on hot merchant accounts with advisory locks.",
          ideal:
            "Sub-account sharding for hot settlement accounts, append-only journal entries, lock ordering to prevent deadlocks, and careful isolation level selection.",
        },
      ],
    },
    {
      applicationId: cloudflareApp.id,
      sessionType: "technical",
      topics: ["Edge Caching", "Connection Pooling", "HTTP/3"],
      duration: 34,
      overallScore: 86,
      daysAgo: 8,
      questions: [
        {
          text: "Why do serverless edge functions exhaust PostgreSQL connections, and how does Hyperdrive mitigate this?",
          type: "technical",
          score: 8.7,
          answer:
            "Each isolate can open a new TCP+TLS handshake to origin Postgres, quickly hitting max_connections and adding 150ms+ cross-region handshake latency. Hyperdrive terminates TLS at the edge, pools connections regionally close to the database, and caches deterministic read queries.",
          ideal:
            "Explain TCP/TLS setup cost, Postgres per-connection memory overhead, edge connection pooling, and read query caching trade-offs.",
        },
        {
          text: "Describe a production outage you helped mitigate and what systemic guardrail you added afterward.",
          type: "behavioral",
          score: 8.5,
          answer:
            "A cache stampede hit our Postgres primary during a deploy after an accidental key-prefix change. We enabled stale-while-revalidate and singleflight coalescing, then added automated load-shedding alerts in Sentry and Grafana.",
          ideal:
            "Clear incident timeline, blameless root cause, immediate mitigation, and durable systemic prevention.",
        },
      ],
    },
    {
      applicationId: vercelApp.id,
      sessionType: "behavioral",
      topics: [
        "React Server Components",
        "DX Trade-offs",
        "Cross-team Alignment",
      ],
      duration: 28,
      overallScore: 84,
      daysAgo: 12,
      questions: [
        {
          text: "How do you decide when to push work to React Server Components vs keeping state on the client?",
          type: "technical",
          score: 8.4,
          answer:
            "Keep data fetching, auth checks, and heavy formatting in Server Components to shrink client JS bundles, and isolate interactive islands (drag-and-drop, instant filters, optimistic editors) into small Client Components with clear serializable props.",
          ideal:
            "Clear boundary between server data/security and client interactivity, avoiding waterfall fetches and over-serialization.",
        },
      ],
    },
    {
      applicationId: datadogApp.id,
      sessionType: "technical",
      topics: ["Kafka Backpressure", "Observability", "High Throughput"],
      duration: 41,
      overallScore: 79,
      daysAgo: 18,
      questions: [
        {
          text: "A single tenant starts sending 20x normal span volume and lags a shared Kafka consumer group. How do you isolate the blast radius?",
          type: "technical",
          score: 7.9,
          answer:
            "Enforce per-tenant token-bucket rate limits at the edge ingestor, route heavy tenants to dedicated overflow partitions or tiered topics, and shed low-priority debug spans before dropping error traces.",
          ideal:
            "Per-tenant quotas, fair queuing / shuffle sharding, priority-based load shedding, and backpressure signaling.",
        },
      ],
    },
    {
      applicationId: anthropicApp.id,
      sessionType: "technical",
      topics: ["LLM Streaming", "Rate Limiting", "Structured Output"],
      duration: 32,
      overallScore: 87,
      daysAgo: 25,
      questions: [
        {
          text: "How would you architect a fault-tolerant SSE streaming gateway for long-running AI responses?",
          type: "technical",
          score: 8.7,
          answer:
            "Use token-bucket rate limiting per org, stream chunks over HTTP/2 SSE with heartbeats and resumable event IDs, buffer partial tokens in Redis for short reconnect windows, and record token usage asynchronously after stream close.",
          ideal:
            "SSE framing, cancellation propagation via AbortSignal, graceful timeout/retry semantics, and accurate usage accounting.",
        },
      ],
    },
    {
      applicationId: stripeApp.id,
      sessionType: "leadership",
      topics: ["Architecture RFCs", "Mentoring", "Technical Debt"],
      duration: 30,
      overallScore: 91,
      daysAgo: 31,
      questions: [
        {
          text: "Tell me about a time you pushed back on a product deadline to protect system reliability.",
          type: "behavioral",
          score: 9.1,
          answer:
            "Before a Black Friday launch, I demonstrated via load tests that our synchronous webhook fan-out would saturate Postgres connections at 3x traffic. I proposed a 4-day scope trade: ship the core checkout behind a queue-backed worker and defer secondary analytics emails by one sprint. Zero downtime during peak.",
          ideal:
            "Evidence-based pushback, collaborative scope negotiation, and measurable business outcome.",
        },
      ],
    },
  ];

  for (const ms of mockSeedData) {
    const createdAt = daysAgo(ms.daysAgo);
    const session = await prisma.aIMockSession.create({
      data: {
        userId: user.id,
        applicationId: ms.applicationId,
        sessionType: ms.sessionType,
        aiPersonality: "professional",
        difficultyLevel: "advanced",
        topics: ms.topics,
        duration: ms.duration,
        overallScore: ms.overallScore,
        feedback: JSON.stringify({
          overallRating: ms.overallScore >= 88 ? "Strong Hire" : "Hire",
          summary: `Strong structured reasoning across ${ms.topics.join(", ")}.`,
        }),
        improvementAreas: [
          "Quantify failure recovery RTO/RPO targets earlier in answers",
          "State trade-offs before diving into implementation details",
        ],
        startedAt: new Date(createdAt.getTime() - ms.duration * 60_000),
        completedAt: createdAt,
        createdAt,
      },
    });

    await prisma.mockQuestion.createMany({
      data: ms.questions.map((q, idx) => ({
        id: `${session.id}-q${idx + 1}`,
        sessionId: session.id,
        questionText: q.text,
        questionType: q.type,
        idealAnswer: q.ideal,
        userAnswer: q.answer,
        timeSpent: 240 + idx * 45,
        score: q.score,
        feedback:
          "Clear mental model, concrete production numbers, and strong failure-mode awareness.",
        strengths: [
          "Directly addressed concurrency and failure modes",
          "Backed claims with real production latency metrics",
        ],
        weaknesses: ["Could explicitly call out monitoring/alerting signals"],
        suggestions: [
          "Close with 1-sentence summary of operational trade-offs",
        ],
        order: idx + 1,
        createdAt,
      })),
    });
  }

  // 6. System Design Sessions linked to JobApplications
  const systemDesigns = [
    {
      applicationId: stripeApp.id,
      title: "Stripe — Idempotent Payments Ledger",
      prompt:
        "Design a globally consistent double-entry payments ledger handling 50k TPS with strict idempotency, zero double charges, and asynchronous settlement.",
      score: 92,
      daysAgo: 3,
      nodes: [
        { id: "n1", type: "client", label: "Merchant SDKs", x: 32, y: 210 },
        {
          id: "n2",
          type: "api-gateway",
          label: "Edge API Gateway",
          x: 225,
          y: 210,
        },
        {
          id: "n3",
          type: "service",
          label: "Ledger & Idempotency Svc",
          x: 430,
          y: 150,
        },
        {
          id: "n4",
          type: "cache",
          label: "Redis Idempotency Lock",
          x: 430,
          y: 310,
        },
        {
          id: "n5",
          type: "database",
          label: "PostgreSQL Ledger Primary",
          x: 650,
          y: 120,
        },
        {
          id: "n6",
          type: "queue",
          label: "Settlement Kafka Topic",
          x: 650,
          y: 260,
        },
      ],
      edges: [
        { id: "e1", from: "n1", to: "n2", label: "HTTPS + Key" },
        { id: "e2", from: "n2", to: "n3", label: "gRPC" },
        { id: "e3", from: "n3", to: "n4", label: "Lock key" },
        { id: "e4", from: "n3", to: "n5", label: "ACID tx" },
        { id: "e5", from: "n3", to: "n6", label: "Outbox event" },
      ],
    },
    {
      applicationId: linearApp.id,
      title: "Linear — Local-First Delta Sync Engine",
      prompt:
        "Design a real-time multi-device issue sync engine with IndexedDB client storage, optimistic mutations, WebSocket fan-out, and sub-50ms p99 reads.",
      score: 94,
      daysAgo: 6,
      nodes: [
        {
          id: "l1",
          type: "client",
          label: "Web + IndexedDB Cache",
          x: 32,
          y: 210,
        },
        {
          id: "l2",
          type: "api-gateway",
          label: "WebSocket Edge Router",
          x: 235,
          y: 210,
        },
        {
          id: "l3",
          type: "service",
          label: "Sync & Mutation Engine",
          x: 445,
          y: 145,
        },
        {
          id: "l4",
          type: "cache",
          label: "Redis Pub/Sub Fan-out",
          x: 445,
          y: 305,
        },
        {
          id: "l5",
          type: "database",
          label: "PostgreSQL Delta Log",
          x: 655,
          y: 185,
        },
      ],
      edges: [
        { id: "le1", from: "l1", to: "l2", label: "WSS Delta" },
        { id: "le2", from: "l2", to: "l3", label: "Mutation" },
        { id: "le3", from: "l3", to: "l5", label: "Append seq" },
        { id: "le4", from: "l3", to: "l4", label: "Broadcast" },
      ],
    },
    {
      applicationId: cloudflareApp.id,
      title: "Cloudflare — Global Edge Asset & API Cache",
      prompt:
        "Design a multi-tier global CDN + Workers compute layer with R2 origin storage, cache-tag invalidation, and Hyperdrive Postgres pooling.",
      score: 87,
      daysAgo: 10,
      nodes: [
        { id: "c1", type: "client", label: "Global Clients", x: 32, y: 210 },
        { id: "c2", type: "cdn", label: "Anycast Edge PoPs", x: 225, y: 210 },
        {
          id: "c3",
          type: "service",
          label: "Workers Isolates",
          x: 430,
          y: 140,
        },
        {
          id: "c4",
          type: "storage",
          label: "Cloudflare R2 Origin",
          x: 650,
          y: 110,
        },
        {
          id: "c5",
          type: "database",
          label: "Hyperdrive + Postgres",
          x: 650,
          y: 260,
        },
      ],
      edges: [
        { id: "ce1", from: "c1", to: "c2", label: "HTTP/3" },
        { id: "ce2", from: "c2", to: "c3", label: "Edge route" },
        { id: "ce3", from: "c3", to: "c4", label: "Read blob" },
        { id: "ce4", from: "c3", to: "c5", label: "Pooled SQL" },
      ],
    },
    {
      applicationId: datadogApp.id,
      title: "Datadog — Distributed Trace Ingestion Pipeline",
      prompt:
        "Design a high-throughput OpenTelemetry ingestion pipeline with per-tenant rate limiting, Kafka buffering, and object-storage archival.",
      score: 82,
      daysAgo: 17,
      nodes: [
        { id: "d1", type: "client", label: "OTel Agents", x: 32, y: 210 },
        {
          id: "d2",
          type: "load-balancer",
          label: "Ingest Load Balancer",
          x: 230,
          y: 210,
        },
        {
          id: "d3",
          type: "service",
          label: "Quota & Ingest Tier",
          x: 435,
          y: 210,
        },
        { id: "d4", type: "queue", label: "Partitioned Kafka", x: 645, y: 130 },
        {
          id: "d5",
          type: "storage",
          label: "Columnar R2 / S3",
          x: 645,
          y: 290,
        },
      ],
      edges: [
        { id: "de1", from: "d1", to: "d2", label: "gRPC OTLP" },
        { id: "de2", from: "d2", to: "d3", label: "Route" },
        { id: "de3", from: "d3", to: "d4", label: "Buffer" },
        { id: "de4", from: "d4", to: "d5", label: "Compact" },
      ],
    },
  ];

  for (const sd of systemDesigns) {
    const ts = daysAgo(sd.daysAgo);
    await prisma.systemDesignSession.create({
      data: {
        userId: user.id,
        applicationId: sd.applicationId,
        title: sd.title,
        prompt: sd.prompt,
        nodesJson: JSON.stringify(sd.nodes),
        edgesJson: JSON.stringify(sd.edges),
        score: sd.score,
        critiqueJson: JSON.stringify({
          score: sd.score,
          summary: `Well-structured distributed topology with clear ingress, persistence, and async boundaries (${sd.nodes.length} components).`,
          strengths: [
            "Clear separation of synchronous request path and asynchronous background processing.",
            "Explicit caching/edge tier absorbs hot read traffic before hitting primary storage.",
          ],
          bottlenecks: [
            "Single primary database node should document read-replica failover and connection pooling limits.",
          ],
          recommendations: [
            "Document p99 latency budget per hop and add dead-letter queue handling for failed async consumers.",
          ],
          source: "ai",
        }),
        createdAt: ts,
        updatedAt: ts,
      },
    });
  }

  // 7. Interview Templates + Scheduled & Completed Live Interviews
  const template1 = await prisma.interviewTemplate.create({
    data: {
      title: "Staff Backend & Distributed Systems Loop",
      description:
        "Architecture, idempotency, PostgreSQL internals, and incident response.",
      category: "System Design",
      difficulty: "Hard",
      duration: 60,
      isPublic: true,
      createdBy: user.id,
      tags: ["PostgreSQL", "Distributed Systems", "Idempotency", "Scale"],
      questions: {
        create: [
          {
            question:
              "Design a multi-region idempotent payment ledger with strict auditability.",
            questionType: "technical",
            difficulty: "Hard",
            timeLimit: 25,
            codeLanguages: ["typescript", "go"],
            order: 1,
          },
          {
            question:
              "How do you diagnose and resolve PostgreSQL vacuum/bloat issues under heavy UPDATE workloads?",
            questionType: "technical",
            difficulty: "Hard",
            timeLimit: 15,
            codeLanguages: ["sql"],
            order: 2,
          },
        ],
      },
    },
  });

  const template2 = await prisma.interviewTemplate.create({
    data: {
      title: "Frontend Architecture & Sync Engine Screen",
      description:
        "React 19 rendering performance, IndexedDB caching, and accessibility.",
      category: "Frontend",
      difficulty: "Medium",
      duration: 45,
      isPublic: true,
      createdBy: user.id,
      tags: ["React", "TypeScript", "WebSockets", "Performance"],
      questions: {
        create: [
          {
            question:
              "Implement an optimistic mutation queue with rollback on server rejection.",
            questionType: "coding",
            difficulty: "Medium",
            timeLimit: 25,
            codeLanguages: ["typescript"],
            order: 1,
          },
        ],
      },
    },
  });

  await prisma.interview.createMany({
    data: [
      {
        candidateId: user.id,
        templateId: template1.id,
        applicationId: stripeApp.id,
        status: "scheduled",
        scheduledAt: daysFromNow(2),
        position: stripeApp.role,
        candidateName: "Alex Mercer",
        candidateEmail: DEMO_EMAIL,
        time: "15:00 UTC",
        type: "video",
        notes: "Stripe Virtual Onsite — Architecture & Debugging panel",
        createdAt: daysAgo(2),
      },
      {
        candidateId: user.id,
        templateId: template2.id,
        applicationId: vercelApp.id,
        status: "scheduled",
        scheduledAt: daysFromNow(5),
        position: vercelApp.role,
        candidateName: "Alex Mercer",
        candidateEmail: DEMO_EMAIL,
        time: "17:30 UTC",
        type: "video",
        notes: "Vercel Pair Programming — RSC & Streaming SSR",
        createdAt: daysAgo(1),
      },
      {
        candidateId: user.id,
        templateId: template2.id,
        applicationId: linearApp.id,
        status: "completed",
        scheduledAt: daysAgo(7),
        completedAt: daysAgo(7),
        duration: 48,
        overallScore: 94,
        technicalScore: 95,
        behavioralScore: 92,
        communicationScore: 94,
        position: linearApp.role,
        candidateName: "Alex Mercer",
        candidateEmail: DEMO_EMAIL,
        type: "video",
        createdAt: daysAgo(7),
      },
      {
        candidateId: user.id,
        templateId: template1.id,
        applicationId: cloudflareApp.id,
        status: "completed",
        scheduledAt: daysAgo(15),
        completedAt: daysAgo(15),
        duration: 55,
        overallScore: 88,
        technicalScore: 90,
        behavioralScore: 85,
        communicationScore: 88,
        position: cloudflareApp.role,
        candidateName: "Alex Mercer",
        candidateEmail: DEMO_EMAIL,
        type: "video",
        createdAt: daysAgo(15),
      },
    ],
  });

  // 8. Coding Challenges & Code Submissions (7 passed, 2 failed across last 5 weeks)
  const challenge1 = await prisma.challenge.create({
    data: {
      userId: user.id,
      title: "Token Bucket Rate Limiter",
      difficulty: "Medium",
      category: "Distributed Systems",
      description:
        "Implement a per-key token bucket rate limiter supporting burst capacity, steady refill rate, and monotonic timestamps.",
      constraints: ["O(1) time per allow() call", "Handle clock skew safely"],
      examples: [
        {
          input: "capacity=5, refill=1/sec",
          output: "first 5 true, 6th false",
        },
      ],
      testCases: [{ input: "burst-5", expected: "true" }],
      tags: ["Rate Limiting", "Systems", "TypeScript"],
      hints: ["Store lastRefillTs and currentTokens per key."],
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      userId: user.id,
      title: "LRU Cache with TTL Expiration",
      difficulty: "Medium",
      category: "Data Structures",
      description:
        "Design an O(1) Least Recently Used cache that evicts expired entries lazily and on capacity overflow.",
      constraints: ["get and put must run in O(1) average time"],
      examples: [
        {
          input: "capacity=2, ttl=1000ms",
          output: "evicts oldest non-expired",
        },
      ],
      testCases: [{ input: "put-get-expire", expected: "null" }],
      tags: ["Cache", "HashMap", "Doubly Linked List"],
      hints: ["JavaScript Map preserves insertion order."],
    },
  });

  const challenge3 = await prisma.challenge.create({
    data: {
      userId: user.id,
      title: "Idempotent Event Deduplicator",
      difficulty: "Hard",
      category: "Concurrency",
      description:
        "Process an out-of-order stream of webhook events ensuring exactly-once side effects within a sliding window.",
      constraints: [
        "Bounded memory footprint",
        "Deterministic ordering per entityId",
      ],
      examples: [{ input: "duplicate event_id", output: "ignored" }],
      testCases: [{ input: "replay-storm", expected: "1 side effect" }],
      tags: ["Idempotency", "Streams", "Concurrency"],
      hints: ["Track per-entity sequence watermark plus bounded seen-ID set."],
    },
  });

  await prisma.codeSubmission.createMany({
    data: [
      {
        userId: user.id,
        challengeId: challenge1.id,
        applicationId: cloudflareApp.id,
        title: "Token Bucket Rate Limiter",
        language: "typescript",
        code: "export class TokenBucket { /* O(1) refill implementation */ }",
        testsPassed: 12,
        totalTests: 12,
        status: "passed",
        createdAt: daysAgo(2),
      },
      {
        userId: user.id,
        challengeId: challenge3.id,
        applicationId: stripeApp.id,
        title: "Idempotent Event Deduplicator",
        language: "typescript",
        code: "export function dedupeEvents(stream) { /* sliding watermark */ }",
        testsPassed: 10,
        totalTests: 10,
        status: "passed",
        createdAt: daysAgo(5),
      },
      {
        userId: user.id,
        challengeId: challenge2.id,
        applicationId: linearApp.id,
        title: "LRU Cache with TTL Expiration",
        language: "typescript",
        code: "export class TTLLRUCache { /* Map-backed O(1) LRU */ }",
        testsPassed: 14,
        totalTests: 14,
        status: "passed",
        createdAt: daysAgo(9),
      },
      {
        userId: user.id,
        challengeId: challenge3.id,
        applicationId: stripeApp.id,
        title: "Idempotent Event Deduplicator",
        language: "go",
        code: "func Dedupe(events []Event) []Event { /* v1 draft */ }",
        testsPassed: 7,
        totalTests: 10,
        status: "failed",
        createdAt: daysAgo(11),
      },
      {
        userId: user.id,
        challengeId: challenge1.id,
        applicationId: datadogApp.id,
        title: "Token Bucket Rate Limiter",
        language: "go",
        code: "type Bucket struct { mu sync.Mutex }",
        testsPassed: 12,
        totalTests: 12,
        status: "passed",
        createdAt: daysAgo(16),
      },
      {
        userId: user.id,
        challengeId: challenge2.id,
        applicationId: vercelApp.id,
        title: "LRU Cache with TTL Expiration",
        language: "python",
        code: "from collections import OrderedDict\nclass LRUCache: ...",
        testsPassed: 14,
        totalTests: 14,
        status: "passed",
        createdAt: daysAgo(22),
      },
      {
        userId: user.id,
        challengeId: challenge1.id,
        applicationId: anthropicApp.id,
        title: "Token Bucket Rate Limiter",
        language: "python",
        code: "class TokenBucket: # initial attempt",
        testsPassed: 9,
        totalTests: 12,
        status: "failed",
        createdAt: daysAgo(28),
      },
      {
        userId: user.id,
        challengeId: challenge2.id,
        applicationId: cloudflareApp.id,
        title: "LRU Cache with TTL Expiration",
        language: "typescript",
        code: "export class EdgeLRUCache { /* verified */ }",
        testsPassed: 14,
        totalTests: 14,
        status: "passed",
        createdAt: daysAgo(33),
      },
    ],
  });

  console.log("✅ Full demo seed complete!");
  console.log(
    "   • 8 Role Dossiers (Offer, Onsite, Screening, Applied, Saved)",
  );
  console.log("   • 6 Tailored CVs linked to roles");
  console.log("   • 5 Tailored Cover Letters linked to roles");
  console.log("   • 7 AI Mock Interview Sessions + 10 graded MockQuestions");
  console.log("   • 4 System Design Architectures + critiques");
  console.log("   • 2 Interview Templates + 4 Live/Scheduled Interviews");
  console.log("   • 3 Coding Challenges + 8 Code Submissions");
  console.log("   • Login: admin@jobprep.local / $Admin2026");

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("Seed failed:", error);
  await prisma.$disconnect();
  process.exit(1);
});
