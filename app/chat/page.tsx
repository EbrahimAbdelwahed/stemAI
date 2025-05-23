'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChat, Message as VercelMessage } from '@ai-sdk/react'; 
import ModelSelector from '../../components/ModelSelector';
import ChatInput from '../../components/ChatInput';
import ChatMessages from '../../components/ChatMessages';
import FileUploader from '../../components/FileUploader';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { track } from '@vercel/analytics';

// Message type from Vercel AI SDK is used directly.
// The SDK's Message type should include toolInvocations for Vercel AI SDK v3+.
type Message = VercelMessage;

type ModelType = 'grok-3-mini' | 'gemini-2-flash' | 'gpt-4o' | 'claude-3-haiku';

const LOCAL_STORAGE_CHAT_ID_KEY = 'stem-ai-chat-id';
const LOCAL_STORAGE_MESSAGES_KEY_PREFIX = 'stem-ai-chat-messages-';

export default function ChatPage() {
  const [chatId, setChatId] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<ModelType>('gpt-4o');
  const [isUploading, setIsUploading] = useState(false);
  // pendingVisualizations state is removed as per refactoring plan.

  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit: originalHandleSubmit, 
    isLoading,
    reload,
    stop,
    error: chatError, 
    setMessages, 
    append 
  } = useChat({
    api: '/api/chat',
    body: {
      model: selectedModel,
    },
    id: chatId, 
    onFinish: (message) => {
      console.log('[ChatPage] onFinish called with message:', message);
      track('ChatResponded', { model: selectedModel, messageId: message.id });
    },
    onError: (err) => {
      console.error('[ChatPage] Chat error from onError callback:', err);
      toast.error(`Chat error: ${err.message}`);
      track('ChatError', { model: selectedModel, error: err.message });
    },
  });

  useEffect(() => {
    const storedChatId = localStorage.getItem(LOCAL_STORAGE_CHAT_ID_KEY);
    if (storedChatId) {
      setChatId(storedChatId);
      const storedMessages = localStorage.getItem(`${LOCAL_STORAGE_MESSAGES_KEY_PREFIX}${storedChatId}`);
      if (storedMessages) {
        try {
          const parsedMessages: Message[] = JSON.parse(storedMessages);
          const validMessages = parsedMessages.map(msg => ({
            ...msg,
            // Ensure `parts` is always an array, even if empty, for consistent rendering logic.
            // And provide a default text part if only content string exists, for older SDK versions.
            parts: msg.parts && msg.parts.length > 0 ? msg.parts : (msg.content ? [{ type: 'text', text: msg.content as string }] : [])
          }));
          setMessages(validMessages);
        } catch (e) {
          console.error("Failed to parse messages from localStorage", e);
          localStorage.removeItem(`${LOCAL_STORAGE_MESSAGES_KEY_PREFIX}${storedChatId}`);
          setMessages([]); 
        }
      }
    } else {
      const newChatId = uuidv4();
      setChatId(newChatId);
      localStorage.setItem(LOCAL_STORAGE_CHAT_ID_KEY, newChatId);
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Hello! I'm your STEM AI Assistant. Ask me anything about science, technology, engineering, or mathematics.",
          parts: [{ type: 'text', text: "Hello! I'm your STEM AI Assistant. Ask me anything about science, technology, engineering, or mathematics." }]
        }
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setChatId, setMessages]); // Adjusted dependencies to reflect what causes initialization

  useEffect(() => {
    if (chatId && messages.length > 0) {
      try {
        localStorage.setItem(`${LOCAL_STORAGE_MESSAGES_KEY_PREFIX}${chatId}`, JSON.stringify(messages));
      } catch (e) {
        console.error("Failed to save messages to localStorage", e);
        toast.error("Could not save chat history. Storage might be full.");
      }
    }
  }, [chatId, messages]);

  // useEffect for processing visualizationSignal and fetchVisualizationParams is removed.
  // fetchVisualizationParams function is removed.

  const handleModelChange = (newModel: ModelType) => {
    setSelectedModel(newModel);
    track('ModelChanged', { newModel });
  };

  const handleFileUploadCallback = useCallback((files: File[]) => {
    if (!files || files.length === 0) {
      toast.error('No file selected for upload.');
      return;
    }
    const file = files[0];

    setIsUploading(true);
    toast.info(`Uploading ${file.name}...`);
    track('FileUploadStarted', { fileName: file.name, fileSize: file.size });

    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/documents', {
      method: 'POST',
      body: formData,
    })
    .then(async response => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to upload file: ${response.statusText}`);
      }
      return response.json();
    })
    .then(result => {
      toast.success(`${file.name} uploaded successfully! You can now ask questions about it.`);
      append({
        id: uuidv4(),
        role: 'user',
        content: `I have uploaded the document "${file.name}". Please summarize its key points. (Context: Document just uploaded, ID: ${result.documentId})`,
        parts: [{type: 'text', text: `I have uploaded the document "${file.name}". Please summarize its key points. (Context: Document just uploaded, ID: ${result.documentId})`}]
      });
      track('FileUploadSucceeded', { fileName: file.name, documentId: result.documentId });
    })
    .catch((error: any) => {
      console.error('File upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
      track('FileUploadFailed', { fileName: file.name, error: error.message });
    })
    .finally(() => {
      setIsUploading(false);
    });
  }, [append, setIsUploading]);

  const handleClearChat = () => {
    const newChatId = uuidv4();
    if(chatId) localStorage.removeItem(`${LOCAL_STORAGE_MESSAGES_KEY_PREFIX}${chatId}`);
    setChatId(newChatId); 
    localStorage.setItem(LOCAL_STORAGE_CHAT_ID_KEY, newChatId);
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your STEM AI Assistant. Ask me anything about science, technology, engineering, or mathematics.",
      parts: [{ type: 'text', text: "Hello! I'm your STEM AI Assistant. Ask me anything about science, technology, engineering, or mathematics." }]
    };
    setMessages([welcomeMessage]);
    toast.info('Chat cleared and new session started.');
    track('ChatCleared');
  };
  
  const handleSubmitWithOptions = (e: React.FormEvent<HTMLFormElement>, options?: { data?: Record<string, any> }) => {
    track('ChatSubmitted', { model: selectedModel, inputLength: input.length });
    originalHandleSubmit(e, options as any); 
  };


  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">STEM AI Assistant</h1>
        <div className="flex items-center space-x-2">
          {/* Changed to onUpload as per linter suggestion */}
          <FileUploader onUpload={handleFileUploadCallback} isUploading={isUploading} disabled={isLoading} />
          <ModelSelector selectedModel={selectedModel} onModelChange={handleModelChange} disabled={isLoading}/>
          <Button variant="outline" onClick={handleClearChat} disabled={isLoading} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            New Chat
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="max-w-3xl mx-auto w-full">
          {chatError && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{chatError.message}</span>
            </div>
          )}
          {/* ChatMessages is now called without pendingVisualizations */}
          <ChatMessages messages={messages} />
          {isLoading && messages[messages.length -1]?.role === 'user' && (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-2 text-gray-600 dark:text-gray-400">AI is thinking...</p>
            </div>
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 z-10 p-4 border-t bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-3xl mx-auto">
          <ChatInput 
            input={input} 
            handleInputChange={handleInputChange} 
            handleSubmit={handleSubmitWithOptions} 
            isLoading={isLoading} 
            reload={reload}
            stop={stop}
            disabled={isUploading}
          />
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            Current Model: {selectedModel}. AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </footer>
    </div>
  );
} 