# API Reference

This document provides a detailed reference for the API endpoints available in the STEM AI Assistant application.

## Overview

The STEM AI Assistant provides two main API endpoints:

1. **Chat API**: For sending messages and receiving AI responses
2. **Documents API**: For uploading and processing documents for the RAG system

All API endpoints are implemented as Next.js API Routes using the App Router pattern.

## Chat API

### Endpoint: `/api/chat`

**Method**: `POST`

**Purpose**: Submit user messages to the AI and receive streamed responses.

**Request Body**:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is quantum entanglement?"
    },
    {
      "role": "assistant",
      "content": "Quantum entanglement is a fascinating phenomenon in quantum physics..."
    },
    {
      "role": "user",
      "content": "Can you explain it more simply?"
    }
  ],
  "model": "grok-3-mini"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | Array | Yes | Array of message objects representing the conversation history |
| `model` | String | No | The AI model to use (default: "grok-3-mini") |

Each message object in the `messages` array must include:

| Field | Type | Description |
|-------|------|-------------|
| `role` | String | Either "user" or "assistant" |
| `content` | String | The message content |

**Response**:

The response is a streamed data format that conforms to the AI SDK's streaming protocol. The content is delivered incrementally as the AI generates it.

**Example Client Usage**:

```typescript
// Using the AI SDK's useChat hook
const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: '/api/chat',
  body: {
    model: 'grok-3-mini'
  },
  maxSteps: 5
});
```

```typescript
// Manual fetch implementation
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'What is quantum entanglement?' }],
    model: 'grok-3-mini'
  }),
});

// Handle streaming response
if (response.body) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    // Process chunk...
  }
}
```

**Implementation Details**:

The chat endpoint performs the following steps:
1. Extracts messages and model selection from the request
2. Gets the latest user message
3. Searches for relevant document chunks using vector similarity
4. Adds relevant document content as context to the system prompt
5. Selects the appropriate LLM based on model parameter
6. Initiates a streaming text generation with the chosen model
7. Returns the stream as a response

## Documents API

### Endpoint: `/api/documents`

**Method**: `POST`

**Purpose**: Upload and process documents for RAG capabilities.

**Request Format**: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | The document file to upload |

**Supported File Types**:
- Text (.txt)
- PDF (.pdf)
- Word Documents (.doc, .docx)

**Response**:

```json
{
  "success": true,
  "documentId": 123,
  "message": "Document \"example.pdf\" uploaded and processed successfully"
}
```

or in case of error:

```json
{
  "error": "Failed to process document"
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `success` | Boolean | Whether the upload was successful |
| `documentId` | Number | The ID of the uploaded document (if successful) |
| `message` | String | A success message (if successful) |
| `error` | String | Error message (if unsuccessful) |

**Example Client Usage**:

```typescript
// Using FormData
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/documents', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
if (result.success) {
  console.log('Document uploaded:', result.message);
} else {
  console.error('Upload failed:', result.error);
}
```

**Implementation Details**:

The documents endpoint performs the following steps:
1. Extracts the file from the form data
2. Reads the text content from the file
3. Stores the document metadata and content in the database
4. Processes the document text into chunks
5. Generates embeddings for each chunk
6. Stores the chunks and embeddings in the database
7. Returns a success response with the document ID

## API Architecture

### Error Handling

All API endpoints implement error handling:

1. **Input Validation**: Checks for required parameters
2. **Try-Catch Blocks**: Wrap operations to catch and handle exceptions
3. **Appropriate Status Codes**: Returns HTTP status codes that match the error condition
4. **Error Messages**: Provides descriptive error messages

### Streaming

The chat API uses HTTP streaming to deliver results incrementally:

1. The AI model generates tokens progressively
2. Each token is immediately streamed to the client
3. The client renders these tokens as they arrive
4. This provides a more responsive user experience

### Authentication

The current implementation does not include authentication. In a production environment, you would want to add:

1. **API Authentication**: Require API keys or tokens
2. **Rate Limiting**: Prevent abuse by limiting requests
3. **User Authentication**: Restrict access to authorized users

## Internal API Functions

### Document Processing

**Function**: `addDocument(title: string, content: string): Promise<number>`

**Location**: `lib/ai/documents.ts`

**Purpose**: Adds a document to the database and generates embeddings.

**Parameters**:
- `title`: Document title (usually filename)
- `content`: Document text content

**Returns**: Promise resolving to the document ID

### Document Search

**Function**: `searchDocuments(query: string, limit = 5): Promise<Array<{...}>>`

**Location**: `lib/ai/documents.ts`

**Purpose**: Searches for relevant document chunks based on a query.

**Parameters**:
- `query`: The search query
- `limit`: Maximum number of results (default: 5)

**Returns**: Promise resolving to an array of matching document chunks with similarity scores

### Embedding Generation

**Function**: `generateEmbeddings(content: string): Promise<Array<{...}>>`

**Location**: `lib/ai/embedding.ts`

**Purpose**: Generates embeddings for text content.

**Parameters**:
- `content`: Text content to embed

**Returns**: Promise resolving to an array of content chunks with their embeddings

## Extension Points

The API architecture is designed to be extensible:

1. **New Models**: Add new AI models by extending the `getModelConfig` function
2. **Additional Endpoints**: Add new API routes for features like saving conversations
3. **Advanced RAG**: Implement more sophisticated document retrieval logic
4. **User Profiles**: Add user-specific document collections and preferences 