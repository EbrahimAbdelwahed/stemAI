# STEM AI Assistant Architecture

This document outlines the high-level architecture of the STEM AI Assistant application, explaining how the various components interact.

## Overview

The STEM AI Assistant is built using a modern Next.js App Router architecture, with React components on the frontend and serverless API routes on the backend. The application leverages the Vercel AI SDK for LLM interactions and a PostgreSQL database with pgvector for document storage and semantic search.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Browser                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                       Next.js Frontend                       │
│                                                             │
│   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐  │
│   │    Home Page  │   │   Chat Page   │   │  Components   │  │
│   │   (app/page)  │   │ (app/chat/*)  │   │               │  │
│   └───────────────┘   └───────────────┘   └───────────────┘  │
│                                                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      Next.js API Routes                      │
│                                                             │
│   ┌───────────────┐   ┌───────────────┐                     │
│   │   Chat API    │   │ Documents API │                     │
│   │ (/api/chat/*) │   │(/api/docs/*)  │                     │
│   └───────────────┘   └───────────────┘                     │
│                                                             │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
┌─────────────────▼───────────┐   ┌───────▼───────────────────┐
│        AI Services          │   │      Database Layer        │
│                            │   │                            │
│   ┌───────────────────┐    │   │   ┌───────────────────┐    │
│   │    Vercel AI SDK  │    │   │   │    Drizzle ORM    │    │
│   └───────────────────┘    │   │   └───────────────────┘    │
│                            │   │                            │
│   ┌───────────────────┐    │   │   ┌───────────────────┐    │
│   │  Model Providers  │    │   │   │     PostgreSQL    │    │
│   │  (OpenAI/xAI/etc) │    │   │   │    with pgvector  │    │
│   └───────────────────┘    │   │   └───────────────────┘    │
│                            │   │                            │
└────────────────────────────┘   └────────────────────────────┘
```

## Core Components

### Frontend Layer

1. **Home Page (`app/page.tsx`)**: 
   - Simple landing page with a link to the chat interface
   - Minimal static content with styling

2. **Chat Page (`app/chat/page.tsx`)**:
   - Main user interface for interacting with the AI
   - Uses the `useChat` hook for connecting to the backend
   - Manages state for chat messages, loading indicators, and error handling
   - Includes model selection and document uploading interfaces

3. **UI Components**:
   - `ChatMessages`: Renders messages with support for different content types
   - `ChatInput`: Auto-expanding input field with submit handling
   - `FileUploader`: Drag-and-drop file upload component
   - `ModelSelector`: Dropdown for selecting different AI models

### Backend Layer

1. **Chat API (`app/api/chat/route.ts`)**:
   - Handles POST requests for chat interactions
   - Extracts user messages and selects appropriate AI model
   - Implements RAG by searching for relevant documents
   - Streams AI responses back to the client

2. **Documents API (`app/api/documents/route.ts`)**:
   - Handles file uploads
   - Processes document text and stores it in the database
   - Creates embeddings for semantic search

### Data Layer

1. **Database Module (`lib/db/`)**:
   - Sets up connection to PostgreSQL with Drizzle ORM
   - Defines database schema for documents and chunks
   - Handles queries and data manipulation

2. **AI Utilities (`lib/ai/`)**:
   - `documents.ts`: Functions for adding and searching documents
   - `embedding.ts`: Functions for generating text embeddings

## Data Flow

1. **User Interaction**:
   - User selects an AI model
   - User uploads documents (optional)
   - User sends a message

2. **Message Processing**:
   - Frontend sends message to `/api/chat` endpoint
   - Backend searches for relevant document chunks
   - Backend selects appropriate LLM based on user selection
   - Backend generates a response with context from documents

3. **Response Streaming**:
   - Response is streamed back to frontend
   - Frontend updates UI in real-time as tokens arrive
   - Special message parts (reasoning, tool calls) are rendered appropriately

4. **Document Handling**:
   - Documents are uploaded to `/api/documents` endpoint
   - Text is extracted and stored in the database
   - Text is split into chunks
   - Embeddings are generated for each chunk
   - Chunks and embeddings are stored for later retrieval

## Key Technical Details

### LLM Integration

The application uses the Vercel AI SDK to interact with multiple LLM providers:
- **xAI** for Grok-3-mini model
- **Google AI** for Gemini 2.0 Flash model
- **OpenAI** as a fallback option

Each model is configured with a specialized system prompt for STEM topics.

### RAG Implementation

The RAG (Retrieval-Augmented Generation) system works as follows:
1. Document text is split into manageable chunks
2. OpenAI's text-embedding-3-small model generates embeddings for each chunk
3. Embeddings are stored in PostgreSQL using pgvector
4. When a user asks a question, the question is converted to an embedding
5. Vector similarity search finds the most relevant document chunks
6. Relevant chunks are prepended to the system prompt as context
7. The LLM generates a response that incorporates both its knowledge and the document context

### Streaming Architecture

The application uses HTTP streaming to deliver results in real-time:
1. The `streamText` function from the AI SDK initiates streaming from the LLM
2. `toDataStreamResponse` converts the stream to a proper HTTP response
3. The `useChat` hook on the frontend connects to this stream
4. UI updates incrementally as new tokens arrive

## AI SDK and AI SDK UI Integration

### AI SDK Core Features

The application leverages Vercel's AI SDK core features:

1. **Unified Model Interface**: The app uses the AI SDK to interact with multiple LLM providers through a consistent interface:
   ```typescript
   // Example from chat API route
   const result = streamText({
     model: selectedModel, // Could be openai(), xai(), or googleai() provider
     messages,
     system: systemPrompt,
     maxSteps: 5 // For multi-step tool usage
   });
   ```

2. **Streaming Text Generation**: Real-time token streaming with `streamText` and `toDataStreamResponse`:
   ```typescript
   // Streaming response to client
   return result.toDataStreamResponse();
   ```

3. **Tool Calling**: Support for AI model to use external tools:
   ```typescript
   const result = streamText({
     // ...
     tools: {
       searchDocuments: tool({
         description: 'Search through uploaded documents for relevant information',
         parameters: z.object({
           query: z.string().describe('The search query'),
         }),
         execute: async ({ query }) => {
           // Implement search functionality
           return relevantResults;
         }
       })
     }
   });
   ```

4. **Provider Configuration**: Easy switching between different AI providers:
   ```typescript
   import { openai } from '@ai-sdk/openai';
   import { xai } from '@ai-sdk/xai';
   import { googleai } from '@ai-sdk/googleai';
   
   // Different model configurations
   const models = {
     'grok-3-mini': xai('grok-3-mini'),
     'gemini-2-flash': googleai('gemini-2-flash'),
     'fallback': openai('gpt-4o')
   };
   ```

### AI SDK UI Features

On the frontend, the application uses AI SDK UI components and hooks:

1. **useChat Hook**: For managing the chat state and interactions:
   ```tsx
   // In app/chat/page.tsx
   const { 
     messages, 
     input, 
     handleInputChange, 
     handleSubmit,
     isLoading,
     error,
     stop,
     reload,
     append
   } = useChat({
     api: '/api/chat',
     body: { model: selectedModel },
     maxSteps: 5 // Enable multi-step reasoning and tool usage
   });
   ```

2. **Message Parts Rendering**: Support for rendering different message part types:
   ```tsx
   // In ChatMessages component
   {message.parts?.map((part, i) => {
     switch (part.type) {
       case 'text':
         return <div key={`${message.id}-${i}`}>{part.text}</div>;
       case 'tool-invocation':
         return <ToolInvocation key={`${message.id}-${i}`} data={part.toolInvocation} />;
       case 'reasoning':
         return <Reasoning key={`${message.id}-${i}`} text={part.reasoning} />;
     }
   })}
   ```

3. **Error Handling**: Built-in error handling and retry functionality:
   ```tsx
   {error && (
     <div className="error-container">
       <p>Error: {error.message}</p>
       <button onClick={reload}>Try again</button>
     </div>
   )}
   ```

4. **Loading States**: Managing UI state during generation:
   ```tsx
   {isLoading && (
     <div className="loading-indicator">
       <Spinner />
       <button onClick={stop}>Stop generating</button>
     </div>
   )}
   ```

5. **Dynamic Message Updates**: Real-time updates as tokens stream in:
   ```tsx
   // AI SDK UI automatically handles updating the messages state
   // as new tokens arrive without additional code
   <div className="messages-container">
     {messages.map(message => (
       <ChatMessage key={message.id} message={message} />
     ))}
   </div>
   ```

These AI SDK features enable the STEM AI Assistant to provide fluid, interactive experiences with complex AI models while maintaining a clean separation between UI concerns and AI integration logic.

## Design Decisions and Tradeoffs

1. **Next.js App Router**: Chosen for its modern architecture and server component support, though slightly more complex than Pages Router.

2. **Vercel AI SDK**: Provides a unified interface to multiple AI providers, simplifying model switching and streaming implementation.

3. **PostgreSQL with pgvector**: Offers robust vector similarity search capabilities necessary for effective RAG, at the cost of more complex deployment requirements.

4. **Drizzle ORM**: Lightweight TypeScript-first ORM that works well with serverless environments.

5. **Multiple AI Models**: Provides flexibility and allows taking advantage of strengths of different models, though requires managing multiple API keys.

## Future Architecture Extensions

The architecture is designed to be extensible in several directions:

1. **Additional AI Models**: New models can be added by extending the model configuration system.

2. **Tool Integration**: The maxSteps parameter allows for multi-step tool executions.

3. **Authentication**: Could be added using Next.js middleware and auth providers.

4. **Multi-modal Support**: The application could be extended to handle image inputs with minimal changes to the architecture.

5. **Citation System**: A source attribution system could be added to track which documents were used in responses.

## Generative UI Features

The application includes a v0.dev-like UI generation feature that allows users to:

1. **Generate React Components**: Create React components using natural language descriptions through an interface similar to v0.dev.
2. **Preview Generated Components**: See a real-time preview of the generated code in a split-pane interface.
3. **Copy and Export Code**: Export generated components for use in other projects.

### Implementation Architecture

The Generative UI feature builds upon the existing AI SDK architecture and extends it with additional components:

```
┌─────────────────────────────────────────────────────────────┐
│                     Generative UI Frontend                   │
│                                                             │
│   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐  │
│   │  SplitPane    │   │ CodePreview   │   │ EnhancedChat  │  │
│   │  Component    │   │  Component    │   │   Component   │  │
│   └───────────────┘   └───────────────┘   └───────────────┘  │
│                                                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Enhanced Chat API Route                   │
│                                                             │
│   ┌───────────────────────────────────────────────────────┐  │
│   │ Function Calling for Component Generation (Tools API)  │  │
│   └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Model Integration                      │
│                                                             │
│   ┌───────────────────────────────────────────────────────┐  │
│   │    Specialized System Prompt for UI Generation         │  │
│   └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **SplitPane Component**: Provides a resizable two-panel layout with the chat interface on the left and the code preview on the right.

2. **CodePreview Component**: Renders both the generated code and its preview, allowing users to toggle between the two views.

3. **EnhancedChatInput Component**: A code-editor-like input that provides a better experience for describing UI components.

4. **ConversationView Component**: Displays the chat history with formatted code blocks and tool invocations.

5. **NavBar Component**: Provides navigation, model selection, and session management functions.

### Tools API Implementation

The component generation leverages Function Calling (Tools API) of the AI SDK:

```typescript
// Example of the Tool Definition for Component Generation
tools: {
  generateReactComponent: {
    description: 'Generate a React component based on the user request',
    parameters: z.object({
      jsx: z.string().describe('The React JSX code for the component'),
      componentName: z.string().describe('The name of the component'),
      description: z.string().describe('A brief description of what the component does'),
    }),
    execute: async function ({ jsx, componentName, description }) {
      return {
        jsx,
        componentName,
        description,
        timestamp: new Date().toISOString()
      };
    }
  }
}
```

This implementation allows the AI model to return structured data that can be rendered as React components, providing a user experience similar to v0.dev but integrated directly into the STEM AI Assistant platform. 