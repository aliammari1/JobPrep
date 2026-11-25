/**
 * Edge-safe ATS Keyword & Quantified-Impact Analyzer.
 * Pure TypeScript — runs identically in browser, Node.js, and Cloudflare Workers.
 */

const STOP_WORDS = new Set([
  "about", "above", "across", "after", "again", "against", "all", "also",
  "among", "an", "and", "any", "are", "as", "at", "be", "because", "been",
  "before", "being", "between", "both", "build", "building", "but", "by",
  "can", "company", "create", "data", "day", "deliver", "design", "develop",
  "developing", "development", "do", "does", "driven", "during", "each",
  "engineer", "engineering", "ensure", "environment", "etc", "every",
  "excellent", "experience", "experienced", "fast", "for", "from", "full",
  "good", "great", "have", "help", "high", "ideal", "impact", "in", "include",
  "including", "into", "is", "it", "its", "job", "join", "key", "knowledge",
  "large", "lead", "leading", "looking", "make", "manage", "may", "more",
  "most", "must", "need", "new", "not", "of", "on", "one", "only", "or",
  "other", "our", "out", "over", "own", "part", "passion", "people", "plus",
  "position", "preferred", "product", "products", "projects", "proven",
  "quality", "related", "required", "requirements", "responsibilities",
  "role", "same", "scale", "senior", "services", "should", "skills", "small",
  "software", "solutions", "some", "strong", "such", "support", "system",
  "systems", "team", "teams", "technical", "technology", "than", "that",
  "the", "their", "them", "these", "they", "this", "through", "time", "to",
  "together", "tools", "understanding", "up", "use", "user", "users", "using",
  "very", "want", "we", "well", "what", "when", "where", "which", "while",
  "who", "will", "with", "within", "without", "work", "working", "world",
  "years", "you", "your",
]);

const KNOWN_TECH_TERMS = [
  "typescript", "javascript", "react", "next.js", "nextjs", "node.js", "nodejs",
  "python", "go", "golang", "rust", "java", "c++", "sql", "postgresql",
  "postgres", "mysql", "mongodb", "redis", "graphql", "rest", "grpc", "docker",
  "kubernetes", "k8s", "aws", "gcp", "azure", "cloudflare", "workers",
  "terraform", "ci/cd", "github actions", "prisma", "drizzle", "tailwind",
  "css", "html", "git", "linux", "microservices", "distributed systems",
  "system design", "machine learning", "llm", "ai", "rag", "pytorch",
  "tensorflow", "playwright", "vitest", "jest", "cypress", "kafka", "rabbitmq",
  "elasticsearch", "snowflake", "dbt", "spark", "figma", "a11y",
  "accessibility", "oauth", "security", "observability", "opentelemetry",
  "sentry", "stripe", "webrtc", "livekit", "websockets", "agile", "scrum",
];

export interface ATSAnalysisResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  totalKeywords: number;
  quantifiedBullets: number;
  totalBullets: number;
}

function normalizeText(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9.+#/\s-]/g, " ");
}

export function extractJobKeywords(jobDescription: string, limit = 18): string[] {
  if (!jobDescription.trim()) return [];
  const normalized = normalizeText(jobDescription);
  const found: string[] = [];
  const seen = new Set<string>();

  // 1. Prioritize known domain/tech terms
  for (const term of KNOWN_TECH_TERMS) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`, "i");
    if (regex.test(normalized) && !seen.has(term)) {
      seen.add(term);
      found.push(term);
    }
  }

  // 2. Supplement with high-frequency meaningful words from the JD
  const freq = new Map<string, number>();
  for (const raw of normalized.split(/\s+/)) {
    const word = raw.replace(/^[.-]+|[.-]+$/g, "");
    if (word.length < 3 || STOP_WORDS.has(word) || seen.has(word)) continue;
    if (/^\d+$/.test(word)) continue;
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }

  const ranked = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  for (const word of ranked) {
    if (found.length >= limit) break;
    if (!seen.has(word)) {
      seen.add(word);
      found.push(word);
    }
  }

  return found.slice(0, limit);
}

export function analyzeATSAlignment(
  jobDescription: string,
  resumeText: string,
  bullets: string[] = [],
): ATSAnalysisResult {
  const keywords = extractJobKeywords(jobDescription);
  const normalizedResume = normalizeText(resumeText);

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of keywords) {
    if (normalizedResume.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const metricRegex = /(\d+%|\$\d+|\d+x|\d+\s?(ms|s|sec|min|k|m|b|users|requests|engineers|teams))/i;
  const cleanBullets = bullets.map((b) => b.trim()).filter(Boolean);
  const quantifiedBullets = cleanBullets.filter((b) => metricRegex.test(b)).length;

  const score =
    keywords.length > 0
      ? Math.round((matchedKeywords.length / keywords.length) * 100)
      : 0;

  return {
    score,
    matchedKeywords,
    missingKeywords,
    totalKeywords: keywords.length,
    quantifiedBullets,
    totalBullets: cleanBullets.length,
  };
}
