# STEM AI Assistant Components

This document provides detailed information about the UI components used in the STEM AI Assistant application.

## Component Overview

STEM AI Assistant is built with a modular component architecture in React. The major UI components include:

1. **ChatMessages**: Displays messages exchanged between the user and AI
2. **ChatInput**: Handles user text input with auto-expanding capability
3. **FileUploader**: Manages document uploads with drag-and-drop support
4. **ModelSelector**: Provides selection between different AI models

## ChatMessages Component

**Location**: `components/ChatMessages.tsx`

**Purpose**: Renders the conversation between the user and the AI, handling different message formats.

**Props**:
- `messages`: Array of Message objects from the AI SDK

**Key Features**:
- Different styling for user and AI messages
- Support for rendering complex message parts:
  - Text parts
  - Tool invocation parts (with inputs and results)
  - Reasoning parts (showing the AI's thought process)
- Welcoming message when no messages are present
- Dark mode support

**Code Sample**:
```tsx
export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {/* Message bubble */}
          <div
            className={`max-w-3xl p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
            }`}
          >
            {/* Message header */}
            <div className="text-sm font-semibold mb-1">
              {message.role === 'user' ? 'You' : 'AI Assistant'}
            </div>
            
            {/* Message content */}
            {message.content ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              <div>
                {/* Handle different message part types */}
                {message.parts?.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return <div key={`${message.id}-${i}`} className="whitespace-pre-wrap">{part.text}</div>;
                    case 'tool-invocation':
                      // Tool invocation rendering
                    case 'reasoning':
                      // Reasoning rendering
                    default:
                      return null;
                  }
                })}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Welcome message when no messages */}
      {messages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-medium">Welcome to the STEM AI Assistant!</p>
          <p className="mt-1">Ask me anything about science, technology, engineering, or math.</p>
        </div>
      )}
    </div>
  );
}
```

## ChatInput Component

**Location**: `components/ChatInput.tsx`

**Purpose**: Provides a text input area for users to submit questions to the AI.

**Props**:
- `input`: Current text input value
- `handleInputChange`: Function to update input value
- `handleSubmit`: Function to submit the form
- `isLoading`: Boolean indicating if a request is in progress

**Key Features**:
- Auto-expanding textarea that grows with content
- Character count display
- Submit on Enter (with Shift+Enter for new line)
- Loading state indication with spinner
- Disable during loading state
- Dark mode support

**Code Sample**:
```tsx
export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          className="w-full p-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[44px] max-h-[200px] shadow-sm transition-all"
          rows={1}
          placeholder="Ask a STEM question..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (input.trim()) {
                handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
              }
            }
          }}
          disabled={isLoading}
        />
        <div className="absolute right-2 bottom-2 text-xs text-gray-400">
          {input.length > 0 && `${input.length} chars • Shift+Enter for new line`}
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 h-[44px] min-w-[80px] shadow-sm flex items-center justify-center transition-colors"
      >
        {isLoading ? (
          <span className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Sending</span>
          </span>
        ) : (
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send
          </span>
        )}
      </button>
    </form>
  );
}
```

## FileUploader Component

**Location**: `components/FileUploader.tsx`

**Purpose**: Enables users to upload documents for the RAG system.

**Props**:
- `onUpload`: Callback function triggered when files are selected

**Key Features**:
- Button-style uploader with clear visual feedback
- Drag-and-drop interface with hover and active states
- File type filtering (.pdf, .txt, .doc, .docx)
- Multiple file upload support
- Responsive design (hides extended text on small screens)
- Dark mode support

**Code Sample**:
```tsx
export default function FileUploader({ onUpload }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Event handlers for drag interactions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files) as File[];
      onUpload(filesArray);
    }
  };

  // Handle manual file selection
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      onUpload(filesArray);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-4">
      <button
        type="button"
        className={`group relative flex items-center rounded-md text-sm px-3 py-2 text-gray-600 dark:text-gray-300 transition-all duration-200 ${
          isDragging || isHovering
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
            : 'bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-300'
        }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={triggerFileInput}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Upload icon */}
        <svg className="..." />
        <span>
          {isDragging ? 'Drop files here' : 'Upload documents'}
          <span className="hidden sm:inline"> or drag and drop</span>
        </span>
        <span className="text-xs ml-2 text-gray-400">
          (PDF, TXT, DOC, DOCX)
        </span>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
        multiple
        accept=".pdf,.txt,.doc,.docx"
      />
    </div>
  );
}
```

## ModelSelector Component

**Location**: `components/ModelSelector.tsx`

**Purpose**: Allows users to select which AI model to use for responses.

**Props**:
- `selectedModel`: Currently selected model
- `onModelChange`: Callback function when a model is selected

**Key Features**:
- Dropdown selector with model options
- Styled to match the application theme
- Responsive design
- Dark mode compatible

**Code Sample**:
```tsx
export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center">
      <label htmlFor="model-selector" className="mr-2 text-sm">
        Model:
      </label>
      <select
        id="model-selector"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value as ModelType)}
        className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

## Chat Page Layout

**Location**: `app/chat/page.tsx`

**Purpose**: Manages the overall chat interface and orchestrates component interactions.

**Key Features**:
- Uses all the above components in a cohesive layout
- Manages chat state using the `useChat` hook
- Handles file upload process and messaging
- Displays loading and error states
- Provides stop generation button when processing
- Responsive container layout
- Dark mode support
- Mobile-friendly design

## Theming and Styling

The components use Tailwind CSS for styling with the following highlights:

- **Color Palette**: Blues for primary actions, grays for UI elements
- **Dark Mode**: Full support with dark mode variants for all components
- **Responsiveness**: Components adapt to different screen sizes
- **Animation**: Subtle transitions for hover states and loading indicators
- **Typography**: Consistent font sizing and weighting throughout the UI
- **Accessibility**: Proper contrast ratios and semantic HTML

## Component Communication

Components in the STEM AI Assistant communicate through:

1. **Props Down**: Parent components pass data and callbacks to children
2. **Events Up**: Child components trigger callbacks to notify parents
3. **Global State**: The `useChat` hook manages shared state for the chat system
4. **API Calls**: Components interact with backend services through API endpoints

## Adding New Components

When adding new components to the system:

1. Create a new file in the `components/` directory
2. Define a TypeScript interface for the component props
3. Implement the component using functional React patterns
4. Add appropriate styling using Tailwind classes
5. Integrate the component into the appropriate page or parent component 