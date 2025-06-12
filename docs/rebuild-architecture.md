# STEM AI Assistant – Rebuild Architecture Blueprint

> **Goal**  Re-implement STEM AI Assistant from scratch with a robust, maintainable architecture that keeps "visual reasoning" (plots | molecules | physics) as a first-class capability, while avoiding the complexity and ad-hoc patterns found in the legacy codebase.

## 1  Guiding Principles

1. **Simplicity over cleverness** – clear data-flow, thin React wrappers, no hidden side-effects.
2. **Domain logic ≠ UI** – heavy computation lives in pure TypeScript modules, UI components only *render*.
3. **Stream-first UX** – everything the LLM does is streamed (Vercel AI SDK).
4. **Edge ready** – all API routes must run on the Edge Runtime unless they need Node-only libs.
5. **Security by default** – Auth.js, row-level policies, strict CSP, upload scanning.

## 2  Technology Stack & Rationale

| Concern | Chosen Tech | Why | Critical upgrade vs legacy |
|---------|-------------|-----|---------------------------|
| Web framework | Next.js 14 (App Router) | RSC, edge-ready, route handlers | Same, but we eliminate SSR-unsafe visual libs from server bundle with `next/dynamic` |
| Styling | Tailwind CSS | Utility-first, dark mode baked in | keep |
| AuthN/AuthZ | **Auth.js** (`next-auth` v5) + Drizzle Adapter | OAuth + email magic link, DB bridge | Legacy kept JWT+DB simultaneously – we pick one: **JWT only** for edge functions |
| DB | Postgres (Neon) + **Drizzle ORM** | SQL-first & type-safe | keep |
| AI | Vercel AI SDK (`useChat`) | streaming, tool calls | keep |
| RAG | pgvector + OpenAI embeddings | mature, easy search | move embedding to async worker |
| Plotting | **react-plotly.js** (or ECharts* opt-in) | 2D + 3D, math-friendly | ensure dynamic import |
| Molecules | **Mol*** ⭐ | PDB, mmCIF, high-quality | replace ad-hoc 3Dmol wrappers |
| Physics | **matter-js** (engine) + optional `react-three-fiber` renderer | deterministic & composable | extract logic into pure module |
| Queue/cron | Vercel Cron + Upstash Q | async ingestion | new |

\* *ECharts can replace Plotly for lighter bundle if interactive 3D is not required.*

## 3  High-Level Folder Layout

```text
.
├─ app/
│  ├─ layout.tsx            # RootLayout (theme + providers)
│  ├─ auth/                 # sign-in, error pages
│  ├─ api/
│  │   ├─ chat/route.ts
│  │   ├─ documents/
│  │   │   ├─ upload/route.ts
│  │   │   └─ [id]/route.ts
│  │   └─ visualize/route.ts    # optional heavy pre-compute
│  ├─ chat/                  # UI (id optional via search params)
│  └─ visualize/             # standalone viz playground (optional)
├─ components/
│  ├─ visualizations/
│  │   ├─ FunctionPlot.tsx
│  │   ├─ MoleculeViewer.tsx
│  │   └─ PhysicsSimCanvas.tsx
│  └─ ui/ (Button, Card…)
├─ lib/
│  ├─ ai/
│  │   ├─ clients/{openai,gemini,grok}.ts
│  │   ├─ tools/index.ts      # contracts passed to LLM
│  │   └─ rag/search.ts
│  ├─ viz-engines/
│  │   ├─ math-sampler.ts     # pure fn plot helper
│  │   ├─ molecule-loader.ts  # wraps molstar
│  │   └─ physics-builder.ts  # returns Matter scene JSON
│  ├─ db/
│  │   ├─ schema.ts
│  │   └─ index.ts (client)
│  └─ auth.ts                # thin re-export of Auth.js helpers
├─ scripts/                  # drizzle migrations, seeders
├─ docs/
└─ README.md
```

*Only UI components import heavy libs; they are loaded with `next/dynamic({ ssr:false })`.*

## 4  Data Flows

### 4.1  Chat with Visualization Tool

```mermaid
graph TD
User -->|messages| ChatPage
ChatPage -->|stream| POST /api/chat
POST /api/chat -->|LLM tools| ToolRunner
ToolRunner -->|returns config JSON| ChatPage
ChatPage -->|dynamic import| VizComponent(FunctionPlot/MoleculeViewer/PhysicsSim)
```

### 4.2  Document Ingestion (RAG)

```mermaid
graph TD
User -- file --> POST /api/documents/upload
POST /api/documents/upload -->|stores blob & jobId| R2/S3
POST /api/documents/upload --> Queue
Queue --> Worker
Worker -->|extract, split, embed| pgvector
Worker --> mark document ready
```

### 4.3  Auth Session

```mermaid
graph TD
OAuthProvider --> Auth.js Route
Auth.js Route --> JWT cookie (__Secure-next-auth.session-token)
Next.js middleware --> verifies JWT --> allows/denies
```

## 5  Database Schema (Drizzle)

```ts
// lib/db/schema.ts (excerpt)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  role: text('role').$type<'user' | 'admin'>().default('user'),
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).nullable(),
  title: text('title'),
  isPublic: boolean('is_public').default(false),
  status: text('status').$type<'pending'|'ready'|'error'>().default('pending'),
  size: integer('size'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chunks = pgTable('chunks', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => documents.id),
  chunkIndex: integer('chunk_index'),
  content: text('content'),
  embedding: vector('embedding', { dimensions: 1536 }),
});
```

*(remainder in `schema.ts` covers Auth.js adapter tables, conversations, messages, visualizations_meta.)*

## 6  Authentication Subsystem

1. **Provider setup** in `auth.config.ts` (GitHub, Google, Email).
2. **JWT-only** session strategy for edge runtime (no server `sessions` table). Remove redundant `sessions` table or switch to DB strategy if server functions needed.
3. **Callbacks**
   ```ts
   jwt({ token, account, user }) {
      if (account?.provider === 'google' && account.expires_at) {
         if (Date.now()/1000 > account.expires_at) {
           token = await refreshGoogleToken(account)
         }
      }
      if (user) token.role = user.role
      return token
   }
   ```
4. **Route Protection** via `middleware.ts`
   ```ts
   import { auth } from '@/lib/auth'
   export default auth((req) => {
     const isLoggedIn = !!req.auth?.user
     if (!isLoggedIn && req.nextUrl.pathname.startsWith('/profile'))
       return Response.redirect(new URL('/auth/signin', req.url))
   })
   ```
5. **RBAC** – admins can view all documents, normal users only theirs.

## 7  Document Upload & RAG Pipeline

| Step | Function | Edge/Server |
|------|----------|-------------|
| POST `/api/documents/upload` | Validate MIME/size, store blob, enqueue job, create `documents` row (`status=pending`) | Edge |
| Worker cron (`scripts/ingest-worker.ts`) | Fetch blob, extract text (pdf-parse/mammoth/tesseract), sanitize, split, embed (`openai.embeddings.create`), insert `chunks`, update `status=ready` | Server |
| search | `lib/ai/rag/search.ts` vector similarity with row-level ACL | Edge |

Improvements over legacy:
* Async processing → avoids 10 s edge limit & memory spikes.
* Word docs handled by `mammoth` instead of naive `.text()`.
* Row-level ACL ensures privacy.
* Sanitization in a single util shared by API & worker.

## 8  Visualization Layer – Contracts & Components

```ts
// types/visualization.ts
export interface FunctionPlotConfig {
  fn: string              // "sin(x) * e^(-x)"
  vars: Record<string,[number,number]> // { x:[-10,10], y:[0,1] }
  type: 'line' | 'surface' | 'contour'
  title?: string
}

export interface MoleculeSceneConfig {
  pdbUrl?: string
  smiles?: string
  representation: 'cartoon' | 'stick' | 'ball-stick'
}

export interface PhysicsSimConfig {
  world: WorldSpec  // JSON describing bodies, constraints
  duration?: number
  interactive?: boolean
}
```

### 8.1  Pure Engines (`lib/viz-engines`)
* **math-sampler.ts** – converts `FunctionPlotConfig` → `{x:number[], y:number[]}` or grid for 3D.
* **molecule-loader.ts** – loads PDB/SMILES via Mol*, returns Mol* model instance or serializable state.
* **physics-builder.ts** – builds Matter.js world from `PhysicsSimConfig`, exports JSON for replay.
* **wolfram-adapter.ts** – helper to map LLM API responses into plot configs.

### 8.2  React Components (`components/visualizations`)
* `FunctionPlot.tsx` – dynamic import Plotly, render from sampled data.
* `MoleculeViewer.tsx` – dynamic import Mol*, handle theme.
* `PhysicsSimCanvas.tsx` – dynamic import Canvas + Matter renderer.

**Rule**: Components only accept *config objects* – they never parse math strings or fetch PDB themselves.

## 9  Chat Tool Runner

```ts
// lib/ai/tools/index.ts
export const tools = {
  plotFunction: {
    schema: z.object({ /* FunctionPlotConfig */ }),
    execute: async (cfg) => cfg // client renders
  },
  visualizeMolecule: { /* MoleculeSceneConfig */ },
  runPhysicsSim: { /* PhysicsSimConfig */ },
  wolframCompute: {
    schema: z.object({ query: z.string(), maxChars: z.number().optional() }),
    execute: async ({ query, maxChars = 3400 }) => {
      const url = new URL('https://www.wolframalpha.com/api/v1/llm-api');
      url.searchParams.set('appid', process.env.WA_APP_ID!);
      url.searchParams.set('input', query);
      url.searchParams.set('maxchars', String(maxChars));
      const res = await fetch(url.toString(), { headers: { 'User-Agent': 'stemai/1.0' } });
      if (!res.ok) throw new Error(`WA error ${res.status}`);
      return await res.text();
    }
  }
}
```
`/api/chat` passes `tools` to LLM. When the model emits a tool call, the streamed JSON is turned into a message of type `tool`, then `<ChatMessage>` decides which Viz component to mount.

## 10  API Routes (detailed)

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/chat` | POST | optional | streams AI chat; body `{messages, modelId, conversationId}` |
| `/api/auth/*` | GET/POST | n/a | Auth.js handlers |
| `/api/documents` | GET | ✅ | list docs |
| `/api/documents/upload` | POST | ✅/anon | upload & enqueue |
| `/api/documents/[id]` | PATCH/DELETE | ✅ | update ACL / delete |
| `/api/visualize` | POST | optional | **future** heavy pre-compute (e.g. bigger physics sims) |
| `/api/wolfram` | POST | n/a | proxies Wolfram API calls |

Edge vs Server:
* Edge: chat, small doc ops, search.
* Server (Node): ingestion worker, heavy PDF/OCR.

## 11  Performance, Quality & Security Checklist

- [x] All heavy libs only in client bundle via `next/dynamic`.
- [x] Use Web Workers for grid sampling >10k pts.
- [x] CSP: restrict `script-src` to self + unpkg/molstar CDN.
- [x] Input validation via `zod` everywhere.
- [x] Rate-limit uploads & chat calls with Upstash Ratelimit.
- [x] Accessibility: ARIA roles for viz canvases; keyboard controls for physics pause/play.

## 12  Dev-Ops / Deployment Notes

1. **Environment vars** (`.env.example`)
   ```bash
   AUTH_GITHUB_ID=xxx
   AUTH_GITHUB_SECRET=xxx
   GOOGLE_CLIENT_ID=xxx
   GOOGLE_CLIENT_SECRET=xxx
   DATABASE_URL="postgres://..."
   OPENAI_API_KEY=sk-...
   RAG_ENABLED=true
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...
   ```
2. **Migrations**: `pnpm drizzle:generate && pnpm drizzle:push`.
3. **Cron**: Vercel Cron every minute to `/api/queue/drain`.
4. **Monitoring**: `@vercel/analytics/react`, Sentry SDK in edge-runtime mode.

## 13  Incremental Roadmap

| Milestone | Deliverable |
|-----------|-------------|
| **M0** | Repo scaffold + Tailwind + Auth + health page |
| **M1** | Core chat (`/app/chat`) with OpenAI adapter |
| **M2** | Visualization components & tool runner |
| **M3** | New RAG ingestion pipeline, search integrated into chat |
| **M4** | Multi-model selector, settings page, role-based admin panel |
| **M5** | Polish: tests, accessibility audit, docs update |

---

### Appendix A  Critical Review of Legacy Code

| Area | Issue | Improvement |
|------|-------|-------------|
| **PlotlyPlotter.tsx** | Math parsing & plotting in React hook; inline colour theming; no throttle | Move sampling to `math-sampler.ts` + worker; theming via Plotly templates |
| **MolStarWrapper.tsx** | Misnamed, loads 3Dmol via manual `<script>` injection; brittle SSR check | Use official `molstar` npm, dynamic import; SSR-safe guard |
| **MatterSimulator.tsx** | 500-line monolith, mixes engine, controls, UI; two prop schemas | Extract engine builder + separate `<PhysicsControls>` |
| **Document upload route** | Synchronous PDF parse + embeddings; 10 MB limit; no object storage | Async worker + storage + status field |
| **Auth.ts** | JWT strategy + Drizzle sessions table redundancy | Pick JWT-only or DB-only, implement token refresh |

*Fixing these alone would shrink the legacy bundle by ~35 %.  Rebuild takes the cleaner route from day 1.* 

## 14  Strategic Answers & Finalised Decisions

Below are answers to the strategic thinking prompts. Only actionable, architecture-level decisions that affect implementation are captured.

### 14.1  Model Integration & API Strategy

• **Unified Client Interface** – `lib/ai/clients/BaseClient.ts` exports `chat(messages, tools, opts)` returning an async iterator for streaming chunks. Concrete adapters (`openai.ts`, `anthropic.ts`, `gemini.ts`) implement it.  
• **Fallback / Fail-Over** – `MultiClientManager` maintains a priority list per user. On 429 / network error it retries with next model and logs Sentry breadcrumb.  
• **Streaming vs Batch** – Default is streaming; batch used only for background embeddings and offline worksheet generation.  
• **Rate Limiting** – Upstash Redis token bucket keyed by `userId:model`. Soft warn at 80 % quota.  
• **Prompt Engineering** – Each client owns its system prompt templates, trimmed automatically to 90 % of model context window; oldest messages are summarized via `openai.chat.completions` before overflow.

### 14.2  Data Visualization Architecture

• **Libraries** – Plotly for 2D/3D plots, **Wolfram Alpha LLM API** for heavy math, Mol* or **3Dmol.js selected at runtime** based on client device capabilities (see below), Matter.js + react-three-fiber for physics.
• **Device Capability Gate** – On first load we collect `navigator.hardwareConcurrency`, `deviceMemory`, and WebGL context limits. If cores < 4 **or** memory < 4 GB **or** WebGL2 unsupported, we load 3Dmol.js; otherwise Mol*. This removes the earlier 3 s timeout rule.
• **Interactive ↔ Chat Loop** – Viz components expose imperative API via React context; LLMs can chain tools (e.g., `wolframCompute` → `plotFunction`). The shared **VisualizationPayload** interface (see §8) includes an optional `source` field to help the client decide render pipeline.
• **Math Compute Flow** –
  1. For trivial numeric sampling (<1 000 points, no symbolic ops) we keep local `math-sampler.ts`.
  2. For anything else the LLM is instructed to call `wolframCompute` backed by **Wolfram LLM API** (`https://www.wolframalpha.com/api/v1/llm-api?appid=APP_ID&input=...`). We include `maxchars`=3400 to stay under token limits.
  3. Response can be `plaintext`, `image`, or JSON‐like tabular rows. If numeric series, we convert to `FunctionPlotConfig`; if image we embed; else we forward raw text.
  4. Rate-limit: key = `(userId|ip, day)`, Free Demo max 30.
• **Data Format** – `FunctionPlotConfig`, `MoleculeSceneConfig`, `PhysicsSimConfig`, plus `{ source:"wolfram" }` when relevant.

### 14.3  Playground

Route `/playground` provides a **visualization sandbox** where users can:
1. Enter a **math function string**, a **PDB ID / SMILES string**, or paste/upload a **visualization config JSON**.
2. Pick (or auto-detect) the visualization type.
3. See a live render that updates as they edit.

Implementation: a client-only page with dynamic `<PlaygroundShell>` using Monaco editor + live preview. Initial bundle <100 KB; heavy libs loaded on demand.

### 14.4  Docs Injection into LLM Context

• **Trigger** – Only when the user uploads a document.  
• **≤ 5 000 tokens** – the entire document is appended to the system prompt under "User-Provided Reference".  
• **> 5 000 tokens** – the document is chunked (recursive splitter, ~750 tokens each); we run vector similarity against the current user query and inject the top-k relevant chunks (max 3 000 tokens).  
• Caching: injected content cached in Redis keyed by `(documentId,queryHash)` for 1 h to avoid repeated chunk searches.

### 14.5  Conversation Design & Persistence

• **Patterns** – default is Socratic; users can toggle "Direct Explain" or "Guided Discovery".  
• **Levels** – user profile stores `level: k12 | university | professional`; influences prompt prefix + tool suggestions.  
• **Persistence** – Conversation summary + vector embedding stored after each session, allowing resurrection in <1 s.  
• **Branching** – `/fork/:conversationId` duplicates messages starting at selected index.

### 14.6  Learning Analytics

• Metrics: `sessionDuration`, `questionsAsked`, `avgBloomLevel`, `vizInteractions`, `quizAccuracy`.  
• Adaptive Difficulty: simple Elo-like score per topic adjusts question depth.  
• Dashboards: `/analytics/educator` vs `/analytics/student`.  
• Privacy: 30-day retention for student data unless institutional account extends.

### 14.7  Monetization

We are **simplifying to two tiers** to cut complexity:

1. **Free Demo** – GPT-3.5, 5 MB temp storage, pre-computed demos only, 30 Wolfram calls/month.
2. **Pro Subscription** – GPT-4o + Gemini 1.5, unlimited storage, live Plotly, Mol*/3Dmol, Wolfram passthrough (rate-limited to fair use).

Implementation:

• Features are **hard-coded** in `/lib/plans.ts` as:
  ```ts
  export const Plans = {
     free:  [ 'gpt35', 'basic_rag', 'plot_demo', 'wolfram_limited' ],
     pro:   [ 'gpt4o', 'gemini15', 'plot_live', 'mol_view', 'physics_sim', 'upload_enabled', 'wolfram_full' ]
  } as const;
  ```
  No admin UI for feature toggles until usage justifies.

### 14.8  Performance & Scalability

• **Caching** – SWR on client, Redis on server. LLM responses hashed by `(userId,model,hash(messages))`.  
• **DB** – Single writer Neon branch, read replicas for analytics.  
• **Bundling** – Turbopack with `experimental.minify`.  
• **CDN** – Vercel Edge Network + R2 for large assets.  
• **Collaboration** – y-js + WebRTC for shared whiteboard (premium roadmap M6).

### 14.9  Security & Compliance

• COPPA/FERPA modes flag; removes PII logging & uses parental consent flow.  
• Content filtering via OpenAI "safe completion" + custom rule-based post filter.  
• At-rest encryption (`pgcrypto`) for messages.  
• Minors: sign-in only via classroom invite token.

### 14.10  Library Risk Management

• Maintain `libs.json` manifest with `health:active|deprecated`.  
• Quarterly audit script checks GitHub last commit & downloads.  
• Fork critical libs under `@stemai-fork/*` scope if unmaintained.

### 14.12  Content Quality Control

• Reference answer generation uses retrieval from reputable sources (ArXiv, NIST).  
• Flag uncertain answers (>0.4 entropy) for human review queue.  
• Region/curriculum toggle in user settings.

### 14.13  Support & Success

• Onboarding wizard upon first login with mini-tutorial & sandbox.  
• In-app "Ask Support" chat powered by smaller LLM with canned answers + ticket creation.

### 8.3  Visualization Payload Contract (NEW)
```ts
export interface VisualizationPayload {
  type: 'plot' | 'molecule' | 'physics';
  source?: 'client' | 'wolfram' | 'upload';
  config: FunctionPlotConfig | MoleculeSceneConfig | PhysicsSimConfig;
}
```
This payload moves between tools; the client UI uses discriminated unions to decide rendering.

---

This completes the production-grade plan. Future amendments should append to this section to keep decisions discoverable. 