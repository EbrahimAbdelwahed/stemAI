# STEM AI Assistant

An intelligent STEM learning platform with multi-model AI chat, interactive visualizations, and document-powered knowledge retrieval (RAG).

**[Live Demo](https://stem-ai.vercel.app)**

## Features

- **Multi-Model AI Chat** — Switch between DeepSeek V3.2, Gemini 2.5 Flash, and DeepSeek Reasoner (optimized for math/science)
- **RAG (Retrieval-Augmented Generation)** — Upload PDFs, TXT, and DOC files to build a knowledge base the AI references in real time
- **3D Molecular Visualization** — Render molecules from SMILES strings or PDB IDs using 3Dmol.js
- **Math Plotting** — 2D and 3D function plotting with Plotly.js and math.js
- **Physics Simulations** — Interactive demos (collisions, pendulums, projectile motion) powered by Matter.js
- **OCR** — Extract text and LaTeX formulas from uploaded images
- **LaTeX Rendering** — Full KaTeX support for inline and block math expressions
- **Authentication** — GitHub and Google OAuth with persistent chat history
- **Analytics** — Vercel Analytics and custom event tracking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15, React 18, TypeScript |
| AI | Vercel AI SDK 4, DeepSeek, Google Gemini (via OpenRouter) |
| Database | PostgreSQL + pgvector (Neon), Drizzle ORM |
| Auth | NextAuth.js v5 (GitHub, Google OAuth) |
| Styling | Tailwind CSS, Lucide Icons |
| Visualizations | Plotly.js, 3Dmol.js, Matter.js, KaTeX |
| Deployment | Vercel (Edge Runtime, Streaming) |

## Architecture

```
app/
├── api/
│   ├── chat/          # Streaming AI chat with tool calling
│   ├── documents/     # Document upload & RAG pipeline
│   └── ocr/           # Image text extraction
├── chat/              # Main chat interface
└── page.tsx           # Landing page

lib/
├── ai/                # Model configs, embeddings, tools
├── db/                # Drizzle schema, queries
├── store/             # Zustand state management
└── analytics/         # Event tracking

components/
├── visualizations/    # 3Dmol, Plotly, Matter.js renderers
├── chat/              # Chat layout, tool result rendering
└── ui/                # Shared UI primitives
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL with pgvector extension (e.g., [Neon](https://neon.tech))

### Setup

```bash
git clone https://github.com/EbrahimAbdelwahed/stemAI.git
cd stemAI
npm install
```

Create a `.env.local` file:

```env
# Required
DATABASE_URL=postgres://user:pass@host:5432/db

# AI Providers (at least one required)
DEEPSEEK_API_KEY=your_key
OPENROUTER_API_KEY=your_key

# Embeddings (required for RAG)
OPENAI_API_KEY=your_key

# Auth (optional)
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_SECRET=...

# Features
RAG_ENABLED=true
```

```bash
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## License

ISC
