# TOOLS.md - Larry's Arsenal

## 🛠️ Development Stack

### Languages & Runtimes
- **Node.js** v22+ (primary runtime)
- **TypeScript** (strict mode, always)
- **Python** 3.11+ (when needed)
- **Bash/Zsh** (automation scripts)

### Frameworks & Libraries
- **Next.js** 14+ (App Router)
- **React** 18+ (TypeScript)
- **tRPC** (type-safe APIs)
- **Prisma** (database ORM)
- **Zod** (validation)
- **TanStack Query** (data fetching)

### Databases
- **PostgreSQL** 16+ (primary)
- **MongoDB** (document store)
- **Redis** (caching, sessions)
- **SQLite** (local dev, testing)

## 🔑 Third-Party Services

### AI & ML
- **OpenAI** (GPT-4, embeddings)
- **Anthropic** (Claude Sonnet/Opus)
- **ElevenLabs** (voice synthesis)

### Payments & Subscriptions
- **Stripe** (payments, invoicing)
- **RevenueCat** (subscription management)

### Communication
- **Twilio** (SMS, voice)
- **Microsoft Graph API** (email: seb@jexhq.com)
- **Telegram** (bot APIs)

### Infrastructure & Monitoring
- **Vercel** (hosting, deployments)
- **Railway** (databases, services)
- **Render** (APIs, workers)
- **Sentry** (error tracking)
- **LogTail** (log aggregation)

### Search & Data
- **Brave Search API** (web search)
- **Algolia** (app search)

## 📊 Development Tools

### Code Quality
- **ESLint** (linting)
- **Prettier** (formatting)
- **TypeScript** strict mode
- **Husky** (pre-commit hooks)

### Testing
- **Vitest** (unit tests)
- **Playwright** (e2e tests)
- **Jest** (legacy tests)

### DevOps
- **Docker** (containerization)
- **GitHub Actions** (CI/CD)
- **Turbo** (monorepo builds)

## 🏗️ Current Projects

### Mission Control
**Status:** Active development  
**Stack:** Next.js 14, TypeScript, Prisma, PostgreSQL  
**Purpose:** AI agent coordination dashboard  
**Features:** Activity feed, task management, calendar, memory browser

### Don AI
**Status:** Production  
**Stack:** Node.js, OpenAI, Stripe  
**Purpose:** AI-powered rizz training  
**Users:** 2.4k active

### Baba
**Status:** Beta  
**Stack:** TypeScript, MongoDB, RevenueCat  
**Purpose:** Toddler meal planning  
**Users:** 380 active

### Together
**Status:** Production  
**Stack:** React Native, tRPC, PostgreSQL  
**Purpose:** Date night accountability  
**Users:** 1.1k couples

### Jex Staffing
**Status:** Internal  
**Stack:** Next.js, Prisma, PostgreSQL  
**Purpose:** Client & project management  
**Users:** Internal team only

## 📝 Code Standards

### TypeScript
```typescript
// Always strict mode
"strict": true
"noUncheckedIndexedAccess": true
"noImplicitAny": true

// Prefer explicit types
const user: User = await getUser(id);

// Validate inputs with Zod
const schema = z.object({ email: z.string().email() });
```

### API Design
```typescript
// tRPC procedures
export const taskRouter = router({
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ input, ctx }) => {
      // Input already validated by Zod
      return ctx.prisma.task.create({ data: input });
    }),
});
```

### Database
```typescript
// Always use transactions for multi-step operations
await prisma.$transaction([
  prisma.task.update({ ... }),
  prisma.activityEvent.create({ ... }),
]);

// Index frequently queried fields
@@index([status, assignee])
```

### Error Handling
```typescript
// Structured errors with context
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Task not found',
  cause: { taskId },
});
```

## 🔐 Security Standards

- All API routes require authentication
- Input validation on every endpoint (Zod)
- Rate limiting on public APIs
- SQL injection prevention (Prisma)
- XSS prevention (React auto-escaping)
- CORS properly configured
- Environment variables for secrets (never commit)

## 📈 Performance Budgets

- **API response time:** <100ms (target), <200ms (max)
- **Page load (FCP):** <1.5s
- **Time to Interactive:** <3.5s
- **Database queries:** <50ms (indexed), <200ms (complex)

## 🚀 Deployment Process

1. **Local testing:** All tests pass, no TypeScript errors
2. **Code review:** PR approved by Larry
3. **Staging deploy:** Test in production-like environment
4. **Production deploy:** Automated via GitHub Actions
5. **Monitoring:** Watch logs/metrics for 15 minutes post-deploy

## 📝 Reporting Chain

- **Engineering Team** → Larry (CTO)
- **Larry** → Rick Sanchez (CEO)
- **Rick** → Seb (Human)

**Never contact Seb directly unless explicitly authorized.**

---

*Last updated: 2026-03-07*
