'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChat, Message as VercelMessage } from '@ai-sdk/react'; 
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ModelSelector from '../../components/ModelSelector';
import ChatInput from '../../components/ChatInput';
import ChatMessages from '../../components/ChatMessages';
import FileUploader from '../../components/FileUploader';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            parts: msg.parts && msg.parts.length > 0 
              ? msg.parts 
              : (msg.content ? [{ type: 'text' as const, text: msg.content as string }] : [])
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
          parts: [{ type: 'text' as const, text: "Hello! I'm your STEM AI Assistant. Ask me anything about science, technology, engineering, or mathematics." }]
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
      parts: [{ type: 'text' as const, text: "Hello! I'm your STEM AI Assistant. Ask me anything about science, technology, engineering, or mathematics." }]
    };
    setMessages([welcomeMessage]);
    toast.info('Chat cleared and new session started.');
    track('ChatCleared');
  };
  
  const handleSubmitWithOptions = (e: React.FormEvent<HTMLFormElement>, options?: { data?: Record<string, any> }) => {
    track('ChatSubmitted', { model: selectedModel, inputLength: input.length });
    originalHandleSubmit(e, options as any); 
  };

  const quickActions = [
    { icon: '🧮', label: 'Solve equation', prompt: 'Help me solve this equation: ' },
    { icon: '🔬', label: 'Explain concept', prompt: 'Explain this scientific concept: ' },
    { icon: '📊', label: 'Analyze data', prompt: 'Help me analyze this data: ' },
    { icon: '💡', label: 'Give examples', prompt: 'Give me examples of: ' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Enhanced Header with Tools */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-16 z-40 glass border-b border-gray-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">AI Assistant Ready</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FileUploader onUpload={handleFileUploadCallback} isUploading={isUploading} disabled={isLoading} />
              <ModelSelector selectedModel={selectedModel} onModelChange={handleModelChange} disabled={isLoading}/>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearChat}
                disabled={isLoading}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-80 glass border-r border-gray-800/50 overflow-y-auto"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-200">Chat History</h3>
                <div className="space-y-2">
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 cursor-pointer"
                  >
                    <p className="text-sm font-medium text-blue-300">Current Chat</p>
                    <p className="text-xs text-gray-400 mt-1">{messages.length} messages</p>
                  </motion.div>
                </div>

                <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-200">Quick Actions</h3>
                <div className="space-y-2">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInputChange({ target: { value: action.prompt } } as any)}
                      className="w-full text-left p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{action.icon}</span>
                        <span className="text-sm text-gray-300">{action.label}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {/* Error State */}
              <AnimatePresence>
                {chatError && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-6"
                  >
                    <div className="glass p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-300">Chat Error</p>
                          <p className="text-xs text-red-200/70">{chatError.message}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced Chat Messages */}
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ChatMessages messages={[message]} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Enhanced Loading State */}
              <AnimatePresence>
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mt-6"
                  >
                    <div className="glass p-6 rounded-xl border border-blue-500/20">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
                          />
                          <div className="absolute inset-0 w-10 h-10 bg-blue-500/10 rounded-full blur-md" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-300">AI is analyzing your request...</p>
                          <p className="text-xs text-gray-400 mt-1">Using {selectedModel}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className="w-2 h-2 bg-blue-400 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>

          {/* Enhanced Input Area */}
          <motion.footer 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass border-t border-gray-800/50"
          >
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
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Powered by {selectedModel}</span>
                  </span>
                  <span>•</span>
                  <span>Shift + Enter for new line</span>
                </div>
                <span className="text-xs text-gray-400">
                  AI can make mistakes. Verify important information.
                </span>
              </div>
            </div>
          </motion.footer>
        </div>
      </div>
    </div>
  );
} 