# Getting Started with STEM AI Assistant

This guide will walk you through the process of setting up and running the STEM AI Assistant on your local machine.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **npm** or **pnpm**: For package management
- **PostgreSQL**: With pgvector extension installed for vector embeddings

## API Keys

You'll need to obtain the following API keys:

1. **OpenAI API Key**: Required for embeddings and fallback model
   - Sign up at [OpenAI](https://platform.openai.com/)
   - Create an API key in your dashboard

2. **xAI API Key**: Required for Grok-3-mini model
   - Sign up for xAI access
   - Generate API key from the developer portal

3. **Google API Key**: Required for Gemini 2.0 Flash model
   - Sign up for Google AI Studio
   - Create an API key for Gemini models

## Database Setup

1. **Create a PostgreSQL database**:
   ```sql
   CREATE DATABASE stemaidb;
   ```

2. **Install pgvector extension**:
   ```sql
   CREATE EXTENSION vector;
   ```

3. **Create the required tables** (optional - the app will handle this with Drizzle migrations):
   ```sql
   CREATE TABLE documents (
     id SERIAL PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     content TEXT NOT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
   );

   CREATE TABLE chunks (
     id SERIAL PRIMARY KEY,
     document_id SERIAL REFERENCES documents(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     embedding VECTOR(1536),
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
   );
   ```

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/stemAI.git
   cd stemAI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**:
   
   Create a `.env.local` file in the root directory with the following content:
   ```env
   # OpenAI API Key (required)
   OPENAI_API_KEY=your_openai_api_key

   # Google API Key (for Gemini models)
   GOOGLE_API_KEY=your_google_api_key

   # xAI API Key (required for Grok models)
   XAI_API_KEY=your_xai_api_key

   # Database URL (required)
   DATABASE_URL=postgres://username:password@localhost:5432/stemaidb
   ```

## Running the Application

1. **Development Mode**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
   The application will be available at `http://localhost:3000`

2. **Production Build**:
   ```bash
   npm run build
   npm start
   # or
   pnpm build
   pnpm start
   ```

## Using the Application

1. **Home Page**: 
   - Navigate to `http://localhost:3000`
   - Click on "Start Chatting" to go to the chat interface

2. **Chat Interface**:
   - Select your preferred AI model from the dropdown
   - Type your STEM-related questions in the input field
   - Upload relevant documents using the file uploader
   - View the AI's responses in real-time

## Troubleshooting

If you encounter any issues during setup:

1. **Database Connection Issues**:
   - Verify your DATABASE_URL is correct
   - Ensure PostgreSQL is running
   - Check that the pgvector extension is installed

2. **API Key Issues**:
   - Ensure your API keys are valid and not expired
   - Check for any quotes or spaces in your .env.local file

3. **Application Errors**:
   - Check the console for specific error messages
   - Ensure all dependencies are installed correctly

## Next Steps

Once you have the application running, proceed to:

- **Uploading Documents**: Add your own STEM-related documents for RAG functionality
- **Customizing**: Modify the system prompts in `app/api/chat/route.ts` for specialized behavior
- **Exploring**: Try different AI models to see their unique capabilities

For a deeper understanding of the application architecture, proceed to the [Architecture](./architecture.md) section. 