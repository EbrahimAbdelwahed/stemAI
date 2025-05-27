'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChat, Message as VercelMessage } from '@ai-sdk/react';
import ChatInput from '../../components/ChatInput';
import ChatMessages from '../../components/ChatMessages';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/Card';
import { Typography } from '../../components/ui/Typography';
import { AppLayout } from '../../components/layout/AppLayout';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { track } from '@vercel/analytics';
import { ChatFlowTracker, trackError } from '@/lib/analytics/event-tracking';
import { RealDataCollector } from '@/lib/analytics/real-data-collector';
import { TypingIndicator } from '../../components/ui/LoadingStates';

// Message type from Vercel AI SDK is used directly.
// The SDK's Message type should include toolInvocations for Vercel AI SDK v3+.
type Message = VercelMessage;

type ModelType = 'grok-3-mini' | 'gemini-1.5-flash-latest' | 'gpt-4o' | 'claude-3-haiku-20240307';

const LOCAL_STORAGE_CHAT_ID_KEY = 'stem-ai-chat-id';
const LOCAL_STORAGE_MESSAGES_KEY_PREFIX = 'stem-ai-chat-messages-';

export default function ChatPage() {
  const [chatId, setChatId] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<ModelType>('grok-3-mini'); // Default to Grok-3-Mini (uses special tokens)
  const [isUploading, setIsUploading] = useState(false);
  const [sessionStartTime] = useState<number>(Date.now());
  const realDataCollector = RealDataCollector.getInstance();
  // pendingVisualizations state is removed as per refactoring plan.

  const onFinishHandler = useCallback((message: Message) => {
    console.log('[ChatPage] onFinish called with message:', message);
    track('ChatResponded', { model: selectedModel, messageId: message.id });
    
    const responseTime = performance.now() - ((window as unknown as { lastMessageTime?: number }).lastMessageTime || 0);
    ChatFlowTracker.aiResponseReceived({
      model: selectedModel,
      response_time: responseTime,
      token_count: message.content?.length || 0,
      tool_calls: message.toolInvocations?.length || 0,
      success: true
    });
    
    if (message.toolInvocations && message.toolInvocations.length > 0) {
      message.toolInvocations.forEach((tool, index) => {
        let tool_type = 'unknown';
        if (tool.toolName === 'displayMolecule3D') tool_type = '3dmol';
        else if (tool.toolName === 'displayPhysicsSimulation') tool_type = 'physics';
        else if (tool.toolName === 'plotFunction2D' || tool.toolName === 'plotFunction3D' || tool.toolName === 'displayPlotlyChart') tool_type = 'plotly';
        else if (tool.toolName.toLowerCase().includes('search') || tool.toolName.toLowerCase().includes('document')) tool_type = 'rag';

        realDataCollector.storeUserEvent('tool_invoked', {
          tool_name: tool.toolName,
          tool_args: tool.args,
          tool_result: 'result' in tool ? tool.result : 'pending',
          tool_type: tool_type,
          model: selectedModel,
          chatId: chatId,
          response_time: responseTime,
          tool_index: index,
          total_tools: message.toolInvocations?.length || 0
        }, '/chat');
      });
    }
    
    realDataCollector.storeUserEvent('ai_response_completed', {
      model: selectedModel,
      response_time: responseTime,
      content_length: message.content?.length || 0,
      tool_count: message.toolInvocations?.length || 0,
      chatId: chatId,
    }, '/chat');
  }, [selectedModel, chatId, realDataCollector]);

  const onErrorHandler = useCallback((err: Error) => {
    console.error('[ChatPage] Chat error from onError callback:', err);
    toast.error(`Chat error: ${err.message}`);
    track('ChatError', { model: selectedModel, error: err.message });
    trackError(err, 'ChatPage', true);
  }, [selectedModel, chatId, realDataCollector]);

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
    onFinish: onFinishHandler,
    onError: onErrorHandler,
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
            parts: msg.parts && msg.parts.length > 0 ? msg.parts : (msg.content ? [{ type: 'text' as const, text: msg.content as string }] : [])
          }));
          setMessages(validMessages);
          
          // Track session resume
          realDataCollector.storeUserEvent('chat_session_resumed', {
            chatId: storedChatId,
            message_count: validMessages.length,
            model: selectedModel
          }, '/chat');
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
      
      // Track new session start
      realDataCollector.storeUserEvent('chat_session_started', {
        chatId: newChatId,
        model: selectedModel,
        session_start_time: sessionStartTime
      }, '/chat');
    }
    
    // Track page view for chat page
    realDataCollector.storePageView('/chat', document.referrer, navigator.userAgent);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setChatId, setMessages, selectedModel, realDataCollector, sessionStartTime]); // Added missing dependencies

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
    const previousModel = selectedModel;
    setSelectedModel(newModel);
    track('ModelChanged', { newModel });
    
    // Enhanced model change tracking
    realDataCollector.storeUserEvent('model_changed', {
      previous_model: previousModel,
      new_model: newModel,
      chatId: chatId,
      conversation_length: messages.length,
      session_duration: Date.now() - sessionStartTime
    }, '/chat');
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
          
          // Enhanced upload tracking
          const uploadStartTime = performance.now();
          realDataCollector.storeUserEvent('file_upload_started', {
            file_name: file.name,
            file_size: file.size,
            file_type: isImage ? 'image' : 'document',
            chatId: chatId,
            model: selectedModel,
            upload_start_time: uploadStartTime
          }, '/chat');

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
              parts: [{ type: 'text' as const, text: ocrMessage }]
            });

            toast.success(`OCR completed for ${file.name}! ${result.extractedText.length} characters extracted.`);
            track('OCRSucceeded', { 
              fileName: file.name, 
              textLength: result.extractedText.length,
              hasFormulas: result.hasFormulas,
              processingTime: result.processingTime 
            });
            
            // Enhanced OCR success tracking
            realDataCollector.storeUserEvent('ocr_completed', {
              file_name: file.name,
              text_length: result.extractedText.length,
              has_formulas: result.hasFormulas,
              processing_time: result.processingTime,
              file_size: file.size,
              chatId: chatId,
              model: selectedModel,
              success: true
            }, '/chat');
          } else {
            // Handle document upload result
            toast.success(`${file.name} uploaded successfully! You can now ask questions about it.`);
            append({
              id: uuidv4(),
              role: 'user',
              content: `I have uploaded the document "${file.name}". Please summarize its key points. (Context: Document just uploaded, ID: ${result.documentId})`,
              parts: [{type: 'text' as const, text: `I have uploaded the document "${file.name}". Please summarize its key points. (Context: Document just uploaded, ID: ${result.documentId})`}]
            });
            track('FileUploadSucceeded', { fileName: file.name, documentId: result.documentId });
            
            // Enhanced document upload success tracking
            realDataCollector.storeUserEvent('document_uploaded', {
              file_name: file.name,
              document_id: result.documentId,
              file_size: file.size,
              chatId: chatId,
              model: selectedModel,
              processing_time: performance.now() - uploadStartTime,
              success: true
            }, '/chat');
          }

                            } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error(`File processing error for ${file.name}:`, error);
            toast.error(`Processing failed for ${file.name}: ${errorMessage}`);
            track('FileProcessingFailed', { fileName: file.name, error: errorMessage, fileType: isImage ? 'image' : 'document' });
        }
      }
    };

    processFiles().finally(() => {
      setIsUploading(false);
    });
  }, [append, setIsUploading, chatId, selectedModel, realDataCollector]);

  const handleClearChat = () => {
    const oldChatId = chatId;
    const sessionDuration = Date.now() - sessionStartTime;
    const messageCount = messages.length;
    
    // Track session end before clearing
    realDataCollector.storeUserEvent('chat_session_ended', {
      chatId: oldChatId,
      session_duration: sessionDuration,
      message_count: messageCount,
      model: selectedModel,
      end_reason: 'user_cleared'
    }, '/chat');
    
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
    
    // Track new session start
    realDataCollector.storeUserEvent('chat_session_started', {
      chatId: newChatId,
      model: selectedModel,
      session_start_time: Date.now(),
      previous_session: oldChatId
    }, '/chat');
  };
  
  const handleSubmitWithOptions = (e: React.FormEvent<HTMLFormElement>, options?: Parameters<typeof originalHandleSubmit>[1]) => {
    track('ChatSubmitted', { model: selectedModel, inputLength: input.length });
    
    // Enhanced analytics tracking
    (window as unknown as { lastMessageTime?: number }).lastMessageTime = performance.now();
    ChatFlowTracker.messageSent({
      model: selectedModel,
      message_length: input.length,
      has_attachments: false, // Could be enhanced to detect attachments
      context_included: messages.length > 1
    });
    ChatFlowTracker.aiProcessingStarted(selectedModel);
    
    originalHandleSubmit(e, options); 
  };

  return (
    <AppLayout>
      {/* Main Chat Interface */}
      <div className="flex flex-col h-screen">
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-white">STEM AI Assistant</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Connected</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
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

            {/* Enhanced Loading State with TypingIndicator */}
            {isLoading && messages[messages.length -1]?.role === 'user' && (
              <div className="flex justify-start mr-8 mt-6">
                <div className="max-w-3xl w-full">
                  <Card variant="enhanced" className="hover:shadow-xl hover:shadow-blue-500/10">
                    {/* Message Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                        <Typography variant="small" className="font-semibold text-blue-400">
                          AI Assistant
                        </Typography>
                      </div>
                      <Typography variant="muted" className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </div>
                    
                    {/* Enhanced Typing Indicator */}
                    <div className="py-4">
                      <TypingIndicator className="mb-2" />
                      <Typography variant="muted" className="text-xs text-gray-500">
                        Processing with {selectedModel}...
                      </Typography>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Sticky Chat Input Footer */}
        <footer className="sticky bottom-0 z-50 border-t border-gray-800/50 bg-gray-900/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <ChatInput 
              input={input} 
              handleInputChange={handleInputChange} 
              handleSubmit={handleSubmitWithOptions} 
              isLoading={isLoading} 
              stop={stop}
              disabled={isUploading}
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              onFileUpload={handleFileUploadCallback}
              isUploading={isUploading}
            />
            <div className="flex items-center justify-center mt-3 text-xs">
              <Typography variant="muted">
                AI can make mistakes. Consider checking important information.
              </Typography>
            </div>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
} 