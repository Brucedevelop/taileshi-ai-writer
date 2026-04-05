# 泰乐施 AI Writing Assistant

**2026 AI-Powered SEO Blog Content Platform for B2B Exporters**

Automated SEO article research, AI writing, image generation, and WordPress publishing targeting international trade companies.

---

## Features

- 🤖 **Multi-Model AI Writing** — GPT-4o, Claude Sonnet/Haiku, Gemini Pro/Flash via OpenRouter
- 🔍 **SERP Research** — SerpAPI integration for data-driven content
- 🖼️ **AI Image Generation** — Recraft.ai professional illustrations
- 📤 **WordPress Publishing** — REST API with Application Passwords
- 📦 **Batch Publishing** — BullMQ job queue with scheduling
- 💳 **WeChat & Alipay** — 虎皮椒 (Hupijiao) QR code payments
- 👑 **Admin Bypass** — Unlimited publishing for admin accounts

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 (Auth.js) |
| AI | OpenRouter unified API (GPT-4o, Claude, Gemini) |
| SERP | SerpAPI |
| Images | Recraft.ai API |
| CMS | WordPress REST API |
| Payment | 虎皮椒 (Hupijiao) — WeChat Pay + Alipay |
| Queue | BullMQ + Redis (Upstash) |
| Email | Resend |
| Hosting | Vercel + Supabase |

---

## Pricing

### Article Publishing

| Type | Price |
|------|-------|
| With AI Images | ¥10/article |
| Without AI Images | ¥6/article |

> **Admin accounts bypass all billing** — unlimited publishing at no cost.

### Credit Packages

| Package | Price | Credits |
|---------|-------|---------|
| 入门版 Starter | ¥60 | 60 |
| 基础版 Basic | ¥200 | 200 |
| 专业版 Pro | ¥500 | 500 |
| 旗舰版 Ultimate | ¥1000 | 1000 |

---

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis instance (Upstash recommended)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Brucedevelop/taileshi-ai-writer.git
cd taileshi-ai-writer

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your API keys and database URL

# 4. Set up database
npm run db:push

# 5. Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
OPENROUTER_API_KEY=""
SERPAPI_KEY=""
RECRAFT_API_KEY=""
HUPIJIAO_APP_ID=""
HUPIJIAO_APP_SECRET=""
REDIS_URL=""
RESEND_API_KEY=""
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

## Project Structure

```
taileshi-ai-writer/
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/            # Login, Register pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API endpoints
├── components/             # React components
│   ├── ui/                # shadcn/ui base components
│   ├── layout/            # Sidebar, Header
│   ├── ai/                # ModelSelector, GenerationProgress
│   ├── payment/           # QRCodePayment, CreditBalance
│   ├── profile/           # ProfileCard, ProfileWizard
│   ├── topics/            # TopicList, TopicGeneratorForm
│   ├── wordpress/         # WPConnectionForm, WPSiteCard
│   └── publish/           # BatchPublishWizard, etc.
├── lib/                    # Core library code
│   ├── llm/               # OpenRouter client, models, prompts
│   ├── billing/           # Credit system with admin bypass
│   ├── payment/           # Hupijiao payment client
│   ├── wordpress/         # WordPress REST API client
│   ├── serp/              # SerpAPI client
│   ├── queue/             # BullMQ batch publisher
│   ├── auth.ts            # NextAuth configuration
│   └── prisma.ts          # Prisma client singleton
└── prisma/
    └── schema.prisma      # Database schema
```

---

## Deployment

### Vercel + Supabase

1. Create a Supabase project for PostgreSQL
2. Deploy to Vercel, set environment variables
3. Run `npx prisma db push` against production DB
4. Configure Upstash Redis for BullMQ

---

## License

Private — All rights reserved © 2026 TaileShi
