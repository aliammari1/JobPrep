<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=150&section=header&text=JobPrep%20AI&fontSize=50&fontColor=fff&animation=fadeIn&fontAlignY=38" width="100%">

# 🚀 JobPrep AI

### *Your AI-Powered Career Companion for Interview Success*

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![LiveKit](https://img.shields.io/badge/LiveKit-WebRTC-00A86B?style=for-the-badge)](https://livekit.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

[🎯 Live Demo](https://jobprep.aliammari.dev) • [📚 Documentation](https://docs.jobprep.ai) • [🐛 Report Bug](https://github.com/aliammari1/JobPrep/issues) • [💡 Request Feature](https://github.com/aliammari1/JobPrep/issues)

---

### ✨ **Land Your Dream Job with AI-Powered Interview Preparation**

JobPrep is a comprehensive, next-generation platform that combines cutting-edge AI technology with practical career tools to help you ace interviews, build stunning CVs, master coding challenges, and stand out in the competitive job market.

</div>

---

## 🎯 Key Highlights

- 🤖 **Multi-AI Intelligence** - Powered by Google Gemini, OpenAI GPT-4, Claude & Ollama
- 🎥 **Real-Time Video Interviews** - LiveKit-powered immersive practice with AI feedback
- 📄 **Professional CV Builder** - ATS-friendly templates with LinkedIn import
- 💻 **Code Challenge Arena** - Practice coding in 15+ languages with instant feedback
- ✍️ **AI Cover Letters** - Generate tailored cover letters in seconds
- 🎤 **Voice & Emotion Analysis** - MediaPipe-powered body language insights
- 📊 **Smart Analytics** - Track progress, identify weak areas, improve systematically
- 🔐 **Secure & Modern** - Passkey authentication, 2FA, enterprise-grade security

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  Next.js 15 • React 19 • TypeScript • Tailwind CSS • shadcn/ui │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                      API Routes Layer                           │
│     /api/ai • /api/interviews • /api/cv • /api/challenges      │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                    AI Services Layer                            │
│   Gemini • OpenAI • Claude • Ollama • HeyGen • MediaPipe       │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                   Real-time Services                            │
│        LiveKit (Video) • Liveblocks • Socket.io                │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                    Data & Storage Layer                         │
│   PostgreSQL (Prisma) • Appwrite • Cloudinary • Stripe         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Features

### 🎤 AI Mock Interviews

| Feature | Description |
|---------|-------------|
| **Multi-AI Support** | Choose between Gemini, GPT-4, Claude, or local Ollama |
| **Real-time Video** | LiveKit-powered HD video/audio with screen sharing |
| **Smart Questions** | AI generates role-specific technical & behavioral questions |
| **Instant Feedback** | Get detailed analysis of answers, tone, and body language |
| **Voice Analysis** | Speech-to-text transcription with emotion detection |
| **Recording** | Save interviews for review and improvement tracking |
| **Scheduling** | Google Calendar integration for practice sessions |

### 📄 CV Builder

| Feature | Description |
|---------|-------------|
| **3 Templates** | Professional, modern, and creative ATS-optimized designs |
| **LinkedIn Import** | Chrome extension auto-fills CV from LinkedIn profile |
| **Smart Suggestions** | AI-powered improvements for bullet points and keywords |
| **Multi-format Export** | PDF, DOCX, JSON with customizable styling |
| **Version Control** | Save multiple versions, track changes over time |
| **Real-time Preview** | Live updates as you type with mobile-responsive view |

### 💻 Code Challenges

| Feature | Description |
|---------|-------------|
| **15+ Languages** | Java, Python, JavaScript, C++, Go, Rust, and more |
| **Difficulty Levels** | Easy, Medium, Hard with curated problem sets |
| **Real-time Execution** | Piston API-powered instant code evaluation |
| **Test Cases** | Run against multiple test cases with detailed feedback |
| **Leaderboard** | Compete with others, track rankings and statistics |
| **Time Tracking** | Practice under interview conditions with timers |

### ✍️ Cover Letter Generator

AI-powered cover letter creation tailored to job descriptions using Gemini & GPT-4 with customizable tone and multiple revisions.

### 🔌 Chrome Extension

One-click LinkedIn CV import - automatically extracts work experience, education, skills, and certifications into JobPrep format.

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.5** - React framework with App Router & Server Components
- **React 19.1** - UI library with React Compiler
- **TypeScript 5** - Type safety
- **Tailwind CSS 4.0** - Utility-first styling
- **shadcn/ui** - Beautiful accessible components
- **Framer Motion** - Smooth animations

### Backend
- **Node.js 20+** - JavaScript runtime
- **Prisma 6.17** - Type-safe ORM
- **PostgreSQL** - Primary database
- **Better Auth 1.3** - Authentication with passkeys & 2FA

### AI & ML
- **Google Gemini** - Primary AI for interviews & CV analysis
- **OpenAI GPT-4** - Advanced reasoning & code evaluation
- **Anthropic Claude** - Alternative AI provider
- **Ollama** - Local AI models (optional)
- **HeyGen** - AI avatar generation
- **MediaPipe** - Body language & emotion analysis

### Real-time & Media
- **LiveKit** - WebRTC video/audio conferencing
- **Socket.io** - Real-time notifications
- **Liveblocks** - Collaborative features

### Storage & Services
- **Appwrite** - File storage & backend services
- **Cloudinary** - Image optimization & CDN
- **Stripe** - Payment processing & subscriptions

### Document Processing
- **pdf-lib** - PDF manipulation
- **mammoth** - DOCX parsing

### Code Execution
- **Piston API** - Multi-language code runner (15+ languages)

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 20+
PostgreSQL 14+
npm or pnpm
Git
```

### Installation

```bash
# Clone repository
git clone https://github.com/aliammari1/JobPrep.git
cd JobPrep

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Visit `http://localhost:3000` 🎉

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jobprep"

# AI APIs
GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_key"
OPENAI_API_KEY="your_openai_key"
ANTHROPIC_API_KEY="your_claude_key"

# Authentication
BETTER_AUTH_SECRET="your_secret_key"
BETTER_AUTH_URL="http://localhost:3000"

# LiveKit (Video)
LIVEKIT_API_KEY="your_livekit_key"
LIVEKIT_API_SECRET="your_livekit_secret"
LIVEKIT_URL="wss://your-project.livekit.cloud"

# Stripe Payments
STRIPE_SECRET_KEY="your_stripe_secret"
STRIPE_WEBHOOK_SECRET="your_webhook_secret"

# Storage
APPWRITE_ENDPOINT="your_appwrite_endpoint"
APPWRITE_PROJECT_ID="your_project_id"
CLOUDINARY_URL="cloudinary://key:secret@cloud_name"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# Google Calendar
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

---

## 📁 Project Structure

```
JobPrep/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── api/               # API routes (35+ endpoints)
│   │   │   ├── ai/           # AI chat & processing
│   │   │   ├── interviews/   # Mock interview endpoints
│   │   │   ├── cv/           # CV builder & export
│   │   │   ├── challenges/   # Code challenge submission
│   │   │   ├── livekit/      # Video conferencing
│   │   │   └── stripe/       # Payment webhooks
│   │   └── layout.tsx        # Root layout
│   ├── components/            # React components (150+)
│   │   ├── ui/               # shadcn/ui components
│   │   ├── interviews/       # Interview-related components
│   │   ├── cv/               # CV builder components
│   │   └── challenges/       # Code editor components
│   ├── lib/                  # Utilities & helpers
│   │   ├── prisma.ts        # Database client
│   │   ├── auth.ts          # Auth configuration
│   │   └── ai/              # AI service integrations
│   └── styles/              # Global styles
├── prisma/
│   └── schema.prisma        # Database schema (25+ models)
├── chrome-extension/        # LinkedIn CV importer
│   ├── manifest.json
│   ├── content.js          # LinkedIn scraper
│   └── popup.html          # Extension UI
├── public/                 # Static assets
└── package.json           # Dependencies (80+)
```

---

## 💾 Database Schema

```prisma
model User {
  id            String          @id @default(cuid())
  email         String          @unique
  name          String?
  image         String?
  interviews    Interview[]
  cvs           CV[]
  submissions   Submission[]
  subscription  Subscription?
  createdAt     DateTime        @default(now())
}

model Interview {
  id            String              @id @default(cuid())
  userId        String
  user          User                @relation(fields: [userId], references: [id])
  jobTitle      String
  jobDescription String
  difficulty    Difficulty
  aiProvider    AIProvider
  questions     Question[]
  responses     InterviewResponse[]
  recordingUrl  String?
  score         Float?
  feedback      String?
  status        InterviewStatus     @default(PENDING)
  scheduledAt   DateTime?
  completedAt   DateTime?
  createdAt     DateTime            @default(now())
}

model CV {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  template      String
  personalInfo  Json
  experience    Json[]
  education     Json[]
  skills        Json[]
  certifications Json[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Challenge {
  id            String       @id @default(cuid())
  title         String
  description   String
  difficulty    Difficulty
  language      String
  testCases     Json[]
  submissions   Submission[]
  tags          String[]
  createdAt     DateTime     @default(now())
}

model Subscription {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  plan          Plan
  status        String
  stripeId      String   @unique
  currentPeriodEnd DateTime
}
```

---

## 🎨 Screenshots

<div align="center">

### 🏠 Dashboard
![Dashboard](https://via.placeholder.com/800x450/1a1a2e/ffffff?text=Smart+Analytics+Dashboard)

### 🎤 AI Mock Interview
![Interview](https://via.placeholder.com/800x450/16213e/ffffff?text=Real-time+AI+Interview)

### 📄 CV Builder
![CV Builder](https://via.placeholder.com/800x450/0f3460/ffffff?text=Professional+CV+Builder)

### 💻 Code Challenges
![Code Challenge](https://via.placeholder.com/800x450/533483/ffffff?text=Multi-language+Code+Arena)

</div>

---

## 🔐 Security

- 🔒 **Modern Authentication** - Better Auth with passkeys & 2FA
- 🛡️ **HTTPS Only** - Automatic SSL via Vercel
- 🔑 **API Key Encryption** - AES-256 encrypted storage
- 🚫 **Rate Limiting** - DDoS & brute force protection
- ✅ **SQL Injection Safe** - Prisma parameterized queries
- 🧹 **XSS Protection** - React automatic HTML sanitization
- 🎫 **CSRF Tokens** - Built-in cross-site attack prevention
- 📋 **Security Headers** - CSP, HSTS, X-Frame-Options

---

## 🗺️ Roadmap

### ✅ Completed (v1.0)
- [x] AI-powered mock interviews with multi-provider support
- [x] Professional CV builder with 3 templates
- [x] Code challenge arena (15+ languages)
- [x] Chrome extension for LinkedIn import
- [x] Real-time video interviews (LiveKit)
- [x] Stripe payment integration
- [x] Dashboard & analytics

### 🚧 In Progress (v1.1 - Q1 2026)
- [ ] 🎓 AI interview coaching with personalized tips
- [ ] 📊 Advanced analytics & skill gap analysis
- [ ] 🎮 Gamification & achievement system
- [ ] 🌍 Multi-language support (i18n)
- [ ] 📱 Mobile responsive improvements

### 🔮 Planned (v2.0 - Q2 2026)
- [ ] 🥽 VR Interview simulation
- [ ] 📱 iOS & Android mobile apps
- [ ] 👥 Peer interview matching
- [ ] 🎓 Interview coaching marketplace
- [ ] 🧠 Emotion detection & personality analysis
- [ ] 🏢 Company-specific prep (FAANG, startups)
- [ ] 🤝 ATS integration & job application tracking

---

## 🤝 Contributing

Contributions are welcome! See our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Fork & clone
git clone https://github.com/YOUR_USERNAME/JobPrep.git

# Create branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m 'feat: add amazing feature'

# Push & create PR
git push origin feature/amazing-feature
```

### Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

Copyright (c) 2024-2025 Ali Ammari

---

## 👨‍💻 Author

<div align="center">

### **Ali Ammari**

[![GitHub](https://img.shields.io/badge/GitHub-@aliammari1-181717?style=for-the-badge&logo=github)](https://github.com/aliammari1)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ali%20Ammari-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/aliammari1)
[![Twitter](https://img.shields.io/badge/Twitter-@aliammari1-1DA1F2?style=for-the-badge&logo=twitter)](https://twitter.com/aliammari1)
[![Website](https://img.shields.io/badge/Website-aliammari.dev-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://aliammari.dev)

**Full-Stack Developer | AI Enthusiast | Open Source Contributor**

</div>

---

## 🙏 Acknowledgments

Special thanks to:
- [Next.js](https://nextjs.org/) - The React Framework
- [Vercel](https://vercel.com/) - Deployment & Hosting
- [Prisma](https://prisma.io/) - Next-gen ORM
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful Components
- [LiveKit](https://livekit.io/) - Real-time Video
- [Better Auth](https://better-auth.com/) - Modern Auth
- [Google AI](https://ai.google.dev/) - Gemini API
- [OpenAI](https://openai.com/) - GPT Models
- [Stripe](https://stripe.com/) - Payments

---

## ⭐ Support

If you find JobPrep helpful:

- ⭐ **Star the repository**
- 🐦 **Share on social media**
- ☕ **[Buy me a coffee](https://buymeacoffee.com/aliammari)**

---

<div align="center">

### 📈 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=aliammari1/JobPrep&type=Date)](https://star-history.com/#aliammari1/JobPrep&Date)

---

**Built with ❤️ by [Ali Ammari](https://github.com/aliammari1)**

*Helping job seekers land their dream jobs, one interview at a time* 🚀

---

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer" width="100%">

</div>
