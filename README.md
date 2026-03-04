# STEM AI — Intelligent Learning Platform

An AI-powered tutoring platform for science, technology, engineering, and mathematics. It combines streaming multi-model LLM chat with interactive educational visualizations and document-based retrieval (RAG) to create an adaptive learning experience.

**Live demo:** https://stem-ai.vercel.app

---

## Features

### Multi-Model AI Chat
- Real-time streaming responses via the Vercel AI SDK
- Supports **DeepSeek V3**, **Google Gemini 2.5 Flash**, **DeepSeek R1** (reasoning), and additional models via OpenRouter
- Persistent conversation history for authenticated users with auto-generated titles

### RAG — Document-Aware Responses
- Upload PDF, TXT, or DOC files; they are chunked, embedded, and stored in PostgreSQL with pgvector
- The assistant automatically retrieves relevant document passages before answering
- Smart RAG cache prevents redundant embedding calls

### Interactive Visualizations (AI-triggered tools)

| Tool | Library | What it does |
|---|---|---|
| **3D Molecular Viewer** | 3Dmol.js | Renders molecules from SMILES strings or PDB IDs |
| **Math Plotter** | Plotly.js | Draws 2D and 3D function graphs |
| **Physics Simulator** | Matter.js | Runs collisions, pendulums, and projectile motion |
| **Conway's Game of Life** | Canvas API | Interactive cellular automaton |
| **OCR** | Sharp + Gemini | Extracts text and LaTeX from uploaded images |

### Math Rendering
- Full LaTeX support (inline `$...$` and block `$$...$$`) via KaTeX
- Math.js evaluates expressions on the client for instant feedback

### Authentication
- GitHub and Google OAuth via NextAuth.js v5
- Sessions persist conversation history and document uploads per user

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15, React 18, TypeScript 5 |
| AI / LLM | Vercel AI SDK 4, DeepSeek, Gemini, OpenRouter |
| Database | PostgreSQL (Neon), Drizzle ORM, pgvector |
| Auth | NextAuth.js v5 |
| Styling | Tailwind CSS 3, Lucide Icons |
| State | Zustand |
| Deployment | Vercel (Edge Runtime, streaming) |

---

## Project Structure

```
stemAI/
├── app/
│   ├── api/
│   │   ├── chat/          # Streaming chat endpoint with tool calling
│   │   ├── documents/     # File upload, chunking, and embedding pipeline
│   │   ├── conversations/ # CRUD for persistent chat history
│   │   └── ocr/           # Image OCR endpoint
│   ├── chat/[id]/         # Dynamic conversation page
│   ├── documents/         # Document management UI
│   └── page.tsx           # Landing page
├── components/
│   ├── chat/              # Chat layout, sidebar, message renderer
│   ├── visualizations/    # Plotly, Matter.js, 3Dmol, Game of Life
│   └── ui/                # Reusable primitives (Button, Card, etc.)
├── lib/
│   ├── ai/
│   │   ├── tools/         # Tool definitions (plot, simulate, molecule, ocr)
│   │   ├── documents.ts   # RAG pipeline
│   │   └── embedding.ts   # Vector embedding generation
│   ├── db/                # Drizzle schema and query helpers
│   └── store/             # Zustand global state
├── docs/                  # Architecture and API reference documentation
└── scripts/               # DB seeding and setup utilities
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database with the `pgvector` extension (e.g. [Neon](https://neon.tech))

### 1. Clone and install

```bash
git clone https://github.com/EbrahimAbdelwahed/stemAI.git
cd stemAI
npm install
```

### 2. Environment variables

Create a `.env.local` file at the project root:

```env
# Database
DATABASE_URL=postgresql://...

# AI providers (add the ones you plan to use)
DEEPSEEK_API_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
OPENROUTER_API_KEY=...

# Auth
AUTH_SECRET=...          # generate with: openssl rand -base64 32
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...

# App URL (for OAuth callbacks)
NEXTAUTH_URL=http://localhost:3000
```

### 3. Initialize the database

```bash
npx drizzle-kit push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run build:analyze` | Build with bundle analyzer |
| `npm run lint` | Run ESLint |

---

## Deployment

The project is configured for **Vercel** out of the box (`vercel.json` included).

1. Import the repository on [vercel.com](https://vercel.com)
2. Add all environment variables listed above
3. Deploy — Vercel detects Next.js automatically

API routes use the **Edge Runtime** where possible for low-latency streaming.

---

## Architecture Highlights

- **Streaming first** — `/api/chat` uses `streamText` with tool calling; responses appear word-by-word in the UI.
- **RAG pipeline** — documents are split into overlapping chunks, embedded with Gemini, stored as vectors, and retrieved via cosine similarity at query time.
- **Tool calling** — the LLM decides when to invoke visualization tools and returns structured JSON that client components hydrate into interactive widgets.
- **Lazy loading** — heavy libraries (Plotly, Matter.js, 3Dmol) are loaded dynamically on first use to keep the initial bundle small.

---

## License

ISC

---

*Built by [Ebrahim Abdelwahed](https://github.com/EbrahimAbdelwahed)*
