'use client';

import { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { useChat, Message as VercelMessage } from '@ai-sdk/react';
import ChatInput from '../../components/ChatInput';
import DocumentPrivacyNotice from '../../components/chat/DocumentPrivacyNotice';
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
import { ChatGPTLayout } from '../../components/chat/ChatGPTLayout';
import { ChatMainArea } from '../../components/chat/ChatMainArea';
import { useAppStore } from '@/lib/store/app-store';
import { useChatActions, useChatState, useDocumentActions, useDocumentState } from '@/lib/store/hooks';
import { LoadingSkeleton } from '@/lib/lazy-loading';

// Lazy load heavy components
const LazyChatMessages = lazy(() => import('../../components/ChatMessages'));

// Message type from Vercel AI SDK is used directly.
// The SDK's Message type should include toolInvocations for Vercel AI SDK v3+.
type Message = VercelMessage;

type ModelType = 'grok-3-mini' | 'gemini-1.5-flash-latest' | 'gpt-4o' | 'claude-3-haiku-20240307' | 'o4-mini';

const LOCAL_STORAGE_CHAT_ID_KEY = 'stem-ai-chat-id';
const LOCAL_STORAGE_MESSAGES_KEY_PREFIX = 'stem-ai-chat-messages-';

export default function ChatPage() {
  const { currentConversation: chatId, selectedModel } = useChatState();
  const { setCurrentConversation, setSelectedModel, setMessages: setMessagesInStore } = useChatActions();
  const { isUploading } = useDocumentState();
  const { setIsUploading } = useDocumentActions();

  const [sessionStartTime] = useState<number>(Date.now());
  const realDataCollector = RealDataCollector.getInstance();
  
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
        else if (tool.toolName.toLowerCase().includes('search') || tool.toolName.toLowerCase().includes('ookument')) tool_type = 'rag';

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
  }, [selectedModel]);

  // Create reactive body object for useChat
  const chatBody = useMemo(() => ({
    model: selectedModel,
  }), [selectedModel]);

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
    body: chatBody,
    id: chatId,
    onFinish: onFinishHandler,
    onError: onErrorHandler,
  });

  useEffect(() => {
    // Check URL parameters first for new chat ID
    const urlParams = new URLSearchParams(window.location.search);
    const urlChatId = urlParams.get('id');
    
    let chatIdToUse = '';
    
    if (urlChatId) {
      // Use URL chat ID if provided (from nuova chat button)
      chatIdToUse = urlChatId;
      setCurrentConversation(urlChatId);
      localStorage.setItem(LOCAL_STORAGE_CHAT_ID_KEY, urlChatId);
      // Clear URL parameter after using it
      window.history.replaceState({}, '', '/chat');
    } else {
      // Fallback to localStorage or create new
      const storedChatId = localStorage.getItem(LOCAL_STORAGE_CHAT_ID_KEY);
      if (storedChatId) {
        chatIdToUse = storedChatId;
        // Avoid redundant state updates that can cause render loops
        if (storedChatId !== chatId) {
          setCurrentConversation(storedChatId);
        }
      } else {
        const newChatId = uuidv4();
        chatIdToUse = newChatId;
        setCurrentConversation(newChatId);
        localStorage.setItem(LOCAL_STORAGE_CHAT_ID_KEY, newChatId);
      }
    }
    
    // Load messages for the selected chat ID
    if (chatIdToUse) {
      const storedMessages = localStorage.getItem(`${LOCAL_STORAGE_MESSAGES_KEY_PREFIX}${chatIdToUse}`);
      if (storedMessages && !urlChatId) {
        // Only restore messages if not a new chat from URL
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
            chatId: chatIdToUse,
            message_count: validMessages.length,
            model: selectedModel
          }, '/chat');
        } catch (e) {
          console.error("Failed to parse messages from localStorage", e);
          localStorage.removeItem(`${LOCAL_STORAGE_MESSAGES_KEY_PREFIX}${chatIdToUse}`);
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content: "Hello! I'm your STEM AI Assistant. Ask me anything about science, technology, engineering, or mathematics.",
              parts: [{ type: 'text' as const, text: "Hello! I'm your STEM AI Assistant. Ask me anything about science, technology, engineering, or mathematics." }]
            }
          ]); 
        }
      } else {
        // New chat or no stored messages - start fresh
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
          chatId: chatIdToUse,
          model: selectedModel,
          session_start_time: sessionStartTime
        }, '/chat');
      }
    }
    
    // Track page view for chat page
    realDataCollector.storePageView('/chat', document.referrer, navigator.userAgent);
  }, [setCurrentConversation, selectedModel, realDataCollector, sessionStartTime, setMessages]);

  useEffect(() => {
    if (chatId && messages.length > 0) {
      try {
        localStorage.setItem(`${LOCAL_STORAGE_MESSAGES_KEY_PREFIX}${chatId}`, JSON.stringify(messages));
        if (chatId) {
          setMessagesInStore(chatId, messages as any);
        }
      } catch (e) {
        console.error("Failed to save messages to localStorage", e);
        toast.error("Could not save chat history. Storage might be full.");
      }
    }
  }, [chatId, messages, setMessagesInStore]);

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
        // More robust image detection
        const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name);
        const isDocument = !isImage && (/\.(pdf|txt|doc|docx)$/i.test(file.name) || file.type.includes('document') || file.type.includes('text'));
        
        // Validate file type
        if (!isImage && !isDocument) {
          toast.error(`Unsupported file type: ${file.name}. Please upload images (JPG, PNG, GIF, BMP, WEBP) or documents (PDF, TXT, DOC, DOCX).`);
          continue;
        }
        
        const endpoint = isImage ? '/api/ocr' : '/api/documents';
        const fileType = isImage ? 'image' : 'document';
        
        try {
          console.log(`[ChatPage] Processing ${fileType}: ${file.name} (MIME: ${file.type})`);
          toast.info(`Processing ${file.name} as ${fileType}...`);
          track('FileUploadStarted', { fileName: file.name, fileSize: file.size, fileType });
          
          // Enhanced upload tracking
          const uploadStartTime = performance.now();
          realDataCollector.storeUserEvent('file_upload_started', {
            file_name: file.name,
            file_size: file.size,
            file_type: fileType,
            mime_type: file.type,
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
          track('FileProcessingFailed', { fileName: file.name, error: errorMessage, fileType });
          
          // Enhanced error tracking
          realDataCollector.storeUserEvent('file_upload_failed', {
            file_name: file.name,
            file_size: file.size,
            file_type: fileType,
            error_message: errorMessage,
            chatId: chatId,
            model: selectedModel,
            success: false
          }, '/chat');
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
    setCurrentConversation(newChatId); 
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
    <ChatGPTLayout currentConversationId={chatId}>
      <ChatMainArea>
                    <Suspense fallback={<LoadingSkeleton className="h-full" />}>
              <LazyChatMessages messages={messages} />
            </Suspense>
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmitWithOptions}
          isLoading={isLoading}
          stop={stop}
          onFileUpload={handleFileUploadCallback}
          disabled={isLoading || isUploading}
        />
      </ChatMainArea>
    </ChatGPTLayout>
  );
} 