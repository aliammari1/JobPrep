# Architecture

## 🏗️ System Architecture Overview

JobPrep AI follows a modern, serverless architecture built on Next.js 15 with the App Router, leveraging server components, API routes, and edge functions for optimal performance.

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  Web Browser • Chrome Extension • Mobile (Responsive)          │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS/WSS
┌────────────────────────┴────────────────────────────────────────┐
│                     Frontend Layer (Next.js)                    │
│  • React 19 Server/Client Components                           │
│  • App Router with Layouts                                     │
│  • Static Generation & Server-Side Rendering                   │
│  • Edge Middleware                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                      API Routes Layer                           │
│  /api/interviews • /api/cv • /api/challenges • /api/ai         │
│  Authentication • Rate Limiting • Validation                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                    Business Logic Layer                         │
│  • Services (Interview, CV, Challenge, AI)                     │
│  • Domain Models                                               │
│  • Use Cases                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                   External Services Layer                       │
│  AI • Video • Storage • Payments • Email                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                    Data Layer (PostgreSQL)                      │
│  Prisma ORM • Connection Pooling • Migrations                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Core Architecture Patterns

### 1. Layered Architecture
- **Presentation Layer**: React components (Server & Client)
- **API Layer**: Next.js API routes
- **Business Logic Layer**: Services and use cases
- **Data Access Layer**: Prisma ORM
- **External Services**: Third-party integrations

### 2. Server-First Approach
- Server Components by default
- Client Components only when needed (interactivity, browser APIs)
- Server Actions for mutations
- Streaming for progressive loading

### 3. API Design
- RESTful endpoints for CRUD operations
- WebSocket for real-time features
- GraphQL considered for future (currently REST)

## 📁 Project Structure

```
JobPrep/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Auth route group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx       # Auth layout
│   │   ├── (dashboard)/         # Protected routes
│   │   │   ├── interviews/
│   │   │   ├── cv/
│   │   │   ├── challenges/
│   │   │   ├── analytics/
│   │   │   └── layout.tsx       # Dashboard layout
│   │   ├── api/                 # API routes
│   │   │   ├── interviews/
│   │   │   ├── cv/
│   │   │   ├── challenges/
│   │   │   ├── ai/
│   │   │   ├── livekit/
│   │   │   └── stripe/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   └── globals.css          # Global styles
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── interviews/          # Interview components
│   │   ├── cv/                  # CV components
│   │   ├── challenges/          # Challenge components
│   │   ├── layouts/             # Layout components
│   │   └── shared/              # Shared components
│   │
│   ├── lib/                     # Utilities & configuration
│   │   ├── prisma.ts           # Database client
│   │   ├── auth.ts             # Auth configuration
│   │   ├── utils.ts            # Utility functions
│   │   ├── ai/                 # AI service integrations
│   │   │   ├── gemini.ts
│   │   │   ├── openai.ts
│   │   │   ├── claude.ts
│   │   │   └── ollama.ts
│   │   ├── services/           # Business logic
│   │   │   ├── interview.ts
│   │   │   ├── cv.ts
│   │   │   ├── challenge.ts
│   │   │   └── analytics.ts
│   │   ├── validation/         # Zod schemas
│   │   └── constants/          # Constants
│   │
│   ├── types/                  # TypeScript types
│   │   ├── api.ts
│   │   ├── database.ts
│   │   └── components.ts
│   │
│   └── hooks/                  # Custom React hooks
│       ├── useInterview.ts
│       ├── useCV.ts
│       └── useChallenge.ts
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Seed data
│
├── public/                     # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── chrome-extension/          # Chrome extension
│   ├── manifest.json
│   ├── content.js
│   └── popup.html
│
└── functions/                 # Serverless functions
    └── scheduled/
```

## 🔄 Data Flow

### 1. Request Flow (Read Operations)

```
User → Component (Server) → API Route → Service → Prisma → PostgreSQL
                                                           ↓
User ← Component (Server) ← API Route ← Service ← Prisma ←
```

### 2. Mutation Flow (Write Operations)

```
User → Form (Client) → Server Action / API → Service → Prisma → PostgreSQL
                                                              ↓
User ← Redirect/Revalidate ← Server Action / API ← Service ←
```

### 3. Real-time Flow (WebSocket)

```
User A → LiveKit → Server → Database
                      ↓
                   User B ← LiveKit
```

## 🗄️ Database Architecture

### Schema Design Principles
1. **Normalized Data**: Proper relationships, minimal redundancy
2. **Type Safety**: Prisma types for compile-time safety
3. **Soft Deletes**: Preserve historical data
4. **Timestamps**: Track creation and updates
5. **Indexes**: Optimized for common queries

### Key Models

```prisma
// Core Models
User → Session, Interview, CV, Submission, Subscription

// Interview Models
Interview → Question, Response, Feedback

// CV Models
CV → Experience, Education, Skill, Certification

// Challenge Models
Challenge → TestCase, Submission

// Subscription
Subscription → Payment
```

### Relationships
- **One-to-Many**: User → Interviews, User → CVs
- **Many-to-Many**: User ↔ Skills (through CV)
- **One-to-One**: User ↔ Subscription

## 🔐 Authentication & Authorization

### Authentication Flow

```
1. User submits credentials
2. Better Auth validates credentials
3. Session created with JWT
4. Session stored in secure cookie
5. Middleware validates session on each request
```

### Authorization Levels
- **Public**: Landing pages, marketing
- **Authenticated**: Dashboard, features
- **Pro**: Advanced features
- **Admin**: Admin panel, analytics

### Security Features
- Passkey support (WebAuthn)
- Two-factor authentication (TOTP)
- Rate limiting per user/IP
- CSRF protection
- SQL injection prevention (Prisma)
- XSS prevention (React sanitization)

## 🤖 AI Integration Architecture

### Multi-Provider Strategy

```
AI Request → AI Router → Provider Selection → API Call → Response
                ↓
         [Gemini, GPT-4, Claude, Ollama]
```

### Provider Selection Logic
1. User preference
2. Feature requirements
3. Cost optimization
4. Availability/fallback

### AI Service Abstraction

```typescript
interface AIProvider {
  generateQuestions(context: InterviewContext): Promise<Question[]>;
  analyzeResponse(response: string): Promise<Feedback>;
  generateCV(data: CVData): Promise<CVSuggestions>;
}
```

## 🎥 Real-time Video Architecture

### LiveKit Integration

```
Client → LiveKit Room → WebRTC → Other Clients
           ↓
    Recording Service → Storage
           ↓
    Transcription → AI Analysis
```

### Components
1. **Room Management**: Create/join rooms
2. **Media Tracks**: Audio, video, screen share
3. **Recording**: Server-side recording
4. **Transcription**: Real-time speech-to-text
5. **Analysis**: Post-interview analysis

## 📊 Analytics Architecture

### Data Collection

```
User Action → Event → Buffer → Batch Processing → Database → Analytics Dashboard
```

### Metrics Tracked
- User engagement (page views, time spent)
- Feature usage (interviews, CVs, challenges)
- Performance (load times, errors)
- Business (conversions, revenue)

### Privacy-First Approach
- No personal data in analytics
- Anonymized user IDs
- Aggregate statistics only
- GDPR compliant

## 🚀 Deployment Architecture

### Vercel Deployment

```
Git Push → GitHub → Vercel Build → Edge Network → Users
                      ↓
              Automatic Preview Deployments
```

### Environments
1. **Development**: Local (localhost:3000)
2. **Preview**: Vercel preview deployments
3. **Staging**: staging.jobprep.ai
4. **Production**: jobprep.aliammari.dev

### Edge Network
- Global CDN
- Edge functions for auth
- Automatic SSL/TLS
- DDoS protection

## 🔄 State Management

### Server State
- Next.js caching
- React Server Components
- SWR for data fetching

### Client State
- React hooks (useState, useReducer)
- URL state for navigation
- Local storage for preferences
- Context for theme/user

### Form State
- React Hook Form
- Zod validation
- Server-side validation

## 📦 Build & Optimization

### Build Process

```
Source Code → TypeScript Compilation → Next.js Build → Optimization → Deployment
                                             ↓
                           [Code Splitting, Tree Shaking, Minification]
```

### Optimization Strategies
1. **Code Splitting**: Dynamic imports
2. **Image Optimization**: Next.js Image
3. **Font Optimization**: next/font
4. **CSS Optimization**: Tailwind purge
5. **Bundle Analysis**: @next/bundle-analyzer

## 🔍 Monitoring & Observability

### Monitoring Stack
- **Error Tracking**: Sentry (optional)
- **Performance**: Vercel Analytics
- **Logs**: Vercel Logs
- **Uptime**: Vercel monitoring

### Key Metrics
- Response time (p50, p95, p99)
- Error rate
- User sessions
- API usage

## 🔒 Security Architecture

### Defense in Depth
1. **Network**: HTTPS, WAF, DDoS protection
2. **Application**: Input validation, CSRF, XSS prevention
3. **Data**: Encryption at rest and in transit
4. **Access**: Authentication, authorization, rate limiting

### Security Layers

```
User → CDN (DDoS) → Edge (Rate Limit) → Auth (Session) → API (Validation) → Database (Encrypted)
```

## 📈 Scalability Considerations

### Horizontal Scaling
- Serverless functions auto-scale
- Database connection pooling
- CDN for static assets
- Edge functions for auth

### Performance Targets
- **Time to First Byte**: <200ms
- **First Contentful Paint**: <1s
- **Largest Contentful Paint**: <2.5s
- **Time to Interactive**: <3.5s

### Bottleneck Prevention
- Database indexes
- Query optimization
- Caching strategies
- Lazy loading
- Progressive enhancement

## 🔄 CI/CD Pipeline

```
Code → Lint → Type Check → Test → Build → Deploy → Monitor
 ↓                                           ↓
Prettier                              Rollback if needed
```

### Automated Checks
- ESLint for code quality
- TypeScript for type safety
- Prettier for formatting
- Tests for functionality
- Build verification

## 📚 Learn More

- [API Documentation](technical/api-documentation.md)
- [Database Schema](technical/database-schema.md)
- [Deployment Guide](deployment/deployment-guide.md)

---

**Last Updated**: March 24, 2026
