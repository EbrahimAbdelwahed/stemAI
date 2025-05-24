'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChat, Message as VercelMessage } from '@ai-sdk/react'; 
import Link from 'next/link';
import ModelSelector from '../../components/ModelSelector';
import ChatInput from '../../components/ChatInput';
import ChatMessages from '../../components/ChatMessages';
import FileUploader from '../../components/FileUploader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Typography } from '../../components/ui/Typography';
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

    setIsUploading(true);

    // Process multiple files
    const processFiles = async () => {
      for (const file of files) {
        const isImage = file.type.startsWith('image/');
        const endpoint = isImage ? '/api/ocr' : '/api/documents';
        
        try {
          console.log(`[ChatPage] Processing ${isImage ? 'image' : 'document'}: ${file.name}`);
          toast.info(`Processing ${file.name}...`);
          track('FileUploadStarted', { fileName: file.name, fileSize: file.size, fileType: isImage ? 'image' : 'document' });

          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to process file: ${response.statusText}`);
          }

          const result = await response.json();

          if (isImage) {
            // Handle OCR result
            const ocrMessage = `📸 **OCR Results from "${file.name}":**

${result.extractedText}${result.hasFormulas ? '\n\n*✨ Mathematical formulas detected and formatted in LaTeX*' : ''}

${result.originalSize && result.optimizedSize ? `*Image optimized: ${result.originalSize} → ${result.optimizedSize}*` : ''}`;

            append({
              id: uuidv4(),
              role: 'assistant',
              content: ocrMessage,
              parts: [{ type: 'text', text: ocrMessage }]
            });

            toast.success(`OCR completed for ${file.name}! ${result.extractedText.length} characters extracted.`);
            track('OCRSucceeded', { 
              fileName: file.name, 
              textLength: result.extractedText.length,
              hasFormulas: result.hasFormulas,
              processingTime: result.processingTime 
            });
          } else {
            // Handle document upload result
            toast.success(`${file.name} uploaded successfully! You can now ask questions about it.`);
            append({
              id: uuidv4(),
              role: 'user',
              content: `I have uploaded the document "${file.name}". Please summarize its key points. (Context: Document just uploaded, ID: ${result.documentId})`,
              parts: [{type: 'text', text: `I have uploaded the document "${file.name}". Please summarize its key points. (Context: Document just uploaded, ID: ${result.documentId})`}]
            });
            track('FileUploadSucceeded', { fileName: file.name, documentId: result.documentId });
          }

        } catch (error: any) {
          console.error(`File processing error for ${file.name}:`, error);
          toast.error(`Processing failed for ${file.name}: ${error.message}`);
          track('FileProcessingFailed', { fileName: file.name, error: error.message, fileType: isImage ? 'image' : 'document' });
        }
      }
    };

    processFiles().finally(() => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Enhanced Navigation Header */}
      <nav className="sticky top-0 z-50 glass border-b border-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <svg 
                    className="w-8 h-8 text-blue-500 group-hover:text-blue-400 transition-colors duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <div className="absolute inset-0 w-8 h-8 bg-blue-500/20 rounded-full blur-md group-hover:bg-blue-400/30 transition-colors duration-200"></div>
                </div>
                <span className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-200">
                  STEM AI Assistant
                </span>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/" className="nav-link">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </Link>
                <span className="nav-link nav-link-active">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat
                </span>
                <Link href="/generate" className="nav-link">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  UI Generator
                </Link>
                <Link href="/test-3dmol" className="nav-link">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  3D Molecules
                </Link>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              <FileUploader onUpload={handleFileUploadCallback} isUploading={isUploading} disabled={isLoading} />
              <ModelSelector selectedModel={selectedModel} onModelChange={handleModelChange} disabled={isLoading}/>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleClearChat} 
                disabled={isLoading}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                New Chat
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Chat Interface */}
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Error State */}
            {chatError && (
              <Card variant="highlight" className="mb-6 border-red-500/30 bg-red-500/5">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <Typography variant="small" color="error" className="font-medium">
                      Chat Error
                    </Typography>
                    <Typography variant="muted" className="text-red-300">
                      {chatError.message}
                    </Typography>
                  </div>
                </div>
              </Card>
            )}

            {/* Chat Messages */}
            <ChatMessages messages={messages} />

            {/* Loading State */}
            {isLoading && messages[messages.length -1]?.role === 'user' && (
              <Card variant="glass" className="mt-6">
                <div className="flex items-center justify-center space-x-3 py-6">
                  <div className="relative">
                    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-8 h-8 bg-blue-500/10 rounded-full blur-sm"></div>
                  </div>
                  <div>
                    <Typography variant="small" className="text-blue-300 font-medium">
                      AI is thinking...
                    </Typography>
                    <Typography variant="muted" className="text-xs">
                      Processing your request with {selectedModel}
                    </Typography>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>

        {/* Enhanced Chat Input Footer */}
        <footer className="sticky bottom-0 z-10 glass border-t border-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <ChatInput 
              input={input} 
              handleInputChange={handleInputChange} 
              handleSubmit={handleSubmitWithOptions} 
              isLoading={isLoading} 
              reload={reload}
              stop={stop}
              disabled={isUploading}
            />
            <div className="flex items-center justify-between mt-3 text-xs">
              <Typography variant="muted" className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Model: {selectedModel}</span>
              </Typography>
              <Typography variant="muted">
                AI can make mistakes. Consider checking important information.
              </Typography>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 