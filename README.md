# STEM AI Assistant

A STEM learning assistant with RAG capabilities powered by multiple AI models using Vercel's AI SDK.

## Features

- Chat with multiple AI models (Grok-3-Mini Beta, Gemini 2.0 Flash)
- Upload documents to enhance the AI's knowledge (RAG)
- Semantic search to find relevant information
- Model selection to switch between different AI models

## Tech Stack

- Next.js
- Vercel AI SDK
- Tailwind CSS
- PostgreSQL with pgvector for vector storage
- Drizzle ORM

## Prerequisites

- Node.js 18+ 
- PostgreSQL database with pgvector extension
- API keys for the models you want to use

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd stemai
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables by creating a `.env.local` file:

```
# OpenAI API Key (required for fallback)
OPENAI_API_KEY=your_openai_api_key

# Google API Key (required for Gemini models)
GOOGLE_API_KEY=your_google_api_key

# xAI API Key (required for Grok models)
XAI_API_KEY=your_xai_api_key

# Anthropic API Key (optional)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Database URL (required)
DATABASE_URL=postgres://username:password@hostname:port/database
```

4. Set up your database:

You need a PostgreSQL database with the pgvector extension installed. You can use services like Neon.tech, which provides this setup.

5. Run database migrations (once the migration scripts are created):

```bash
npm run db:migrate
```

## Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Visit the homepage and click "Start Chatting"
2. Use the model selector to choose your preferred AI model
3. Upload documents using the file uploader to enhance the AI's knowledge
4. Ask questions related to the uploaded documents or general STEM topics

## API Keys

### Getting a Google API Key
To use the Gemini models, you'll need a Google API key:
1. Visit Google AI Studio at https://aistudio.google.com/
2. Create a project and generate an API key
3. Add the API key to your `.env.local` file as `GOOGLE_API_KEY`

### Getting an xAI API Key
To use the Grok models, you'll need an xAI API key:
1. Visit the xAI Platform at https://platform.xai.com/
2. Create an account and generate an API key
3. Add the API key to your `.env.local` file as `XAI_API_KEY`

## Future Improvements

- Add authentication
- Support for more file types (PDF parsing, etc.)
- Additional AI models
- Enhanced RAG techniques
- User management and personalized knowledge bases 