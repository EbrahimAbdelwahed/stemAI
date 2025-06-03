'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useChat, Message as VercelMessage } from '@ai-sdk/react';
import ChatInput from '../../../components/ChatInput';
import ChatMessages from '../../../components/ChatMessages';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/Card';
import { Typography } from '../../../components/ui/Typography';
import { ChatGPTLayout } from '../../../components/chat/ChatGPTLayout';
import { ChatMainArea } from '../../../components/chat/ChatMainArea';
import { toast } from 'sonner';
import { track } from '@vercel/analytics';
import { ChatFlowTracker, trackError } from '@/lib/analytics/event-tracking';
import { RealDataCollector } from '@/lib/analytics/real-data-collector';
import { TypingIndicator } from '../../../components/ui/LoadingStates';

type Message = VercelMessage;
type ModelType = 'grok-3-mini' | 'gemini-1.5-flash-latest' | 'gpt-4o' | 'claude-3-haiku-20240307' | 'o4-mini';

interface ConversationData {
  id: string
  title: string
  model: string
  createdAt: string
  updatedAt: string
  messages: Array<{
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    createdAt: string
    parts?: any[]
    tokenUsage?: any
    metadata?: any
  }>
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const conversationId = params.id as string;
  
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelType>('grok-3-mini');
  const [isUploading, setIsUploading] = useState(false);
  const [sessionStartTime] = useState<number>(Date.now());
  const realDataCollector = RealDataCollector.getInstance();

  // Create reactive body object for useChat
  const chatBody = useMemo(() => ({
    model: selectedModel,
    conversationId: conversationId,
  }), [selectedModel, conversationId]);

  const onFinishHandler = useCallback((message: Message) => {
    console.log('[ConversationPage] onFinish called with message:', message);
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
          conversationId: conversationId,
          response_time: responseTime,
          tool_index: index,
          total_tools: message.toolInvocations?.length || 0
        }, `/chat/${conversationId}`);
      });
    }
    
    realDataCollector.storeUserEvent('ai_response_completed', {
      model: selectedModel,
      response_time: responseTime,
      content_length: message.content?.length || 0,
      tool_count: message.toolInvocations?.length || 0,
      conversationId: conversationId,
    }, `/chat/${conversationId}`);
  }, [selectedModel, conversationId, realDataCollector]);

  const onErrorHandler = useCallback((err: Error) => {
    console.error('[ConversationPage] Chat error from onError callback:', err);
    toast.error(`Chat error: ${err.message}`);
    track('ChatError', { model: selectedModel, error: err.message, conversationId });
    trackError(err, 'ConversationPage', true);
  }, [selectedModel, conversationId]);

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
    id: conversationId,
    onFinish: onFinishHandler,
    onError: onErrorHandler,
  });

  // Load conversation data after useChat is initialized
  useEffect(() => {
    const loadConversation = async () => {
      setIsLoadingConversation(true);
      
      try {
        const response = await fetch(`/api/conversations/${conversationId}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Conversation not found');
            router.push('/chat');
            return;
          }
          throw new Error('Failed to load conversation');
        }

        const data = await response.json();
        const conversation = data.conversation;
        
        setConversationData(conversation);
        setSelectedModel(conversation.model as ModelType || 'grok-3-mini');
        
        // Convert database messages to Vercel AI format
        const convertedMessages: Message[] = conversation.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          parts: msg.parts || [{ type: 'text' as const, text: msg.content }],
          createdAt: new Date(msg.createdAt),
        }));
        
        setMessages(convertedMessages);
        
        // Track conversation load
        realDataCollector.storeUserEvent('conversation_loaded', {
          conversationId,
          messageCount: conversation.messages.length,
          model: conversation.model
        }, `/chat/${conversationId}`);
        
      } catch (error) {
        console.error('Error loading conversation:', error);
        toast.error('Failed to load conversation');
        router.push('/chat');
      } finally {
        setIsLoadingConversation(false);
      }
    };

    if (conversationId && setMessages) {
      loadConversation();
    }
  }, [conversationId, router, realDataCollector, setMessages]);

  const handleModelChange = (newModel: ModelType) => {
    const previousModel = selectedModel;
    setSelectedModel(newModel);
    track('ModelChanged', { newModel, conversationId });
    
    realDataCollector.storeUserEvent('model_changed', {
      previous_model: previousModel,
      new_model: newModel,
      conversationId: conversationId,
      conversation_length: messages.length,
      session_duration: Date.now() - sessionStartTime
    }, `/chat/${conversationId}`);
  };

  const handleFileUploadCallback = useCallback((files: File[]) => {
    if (!files || files.length === 0) {
      toast.error('No file selected for upload.');
      return;
    }

    setIsUploading(true);
    
    // Handle file upload logic here
    // This would be similar to the original chat page implementation
    
    setIsUploading(false);
  }, []);

  const handleClearChat = () => {
    setMessages([]);
    track('ChatCleared', { conversationId });
    
    realDataCollector.storeUserEvent('conversation_cleared', {
      conversationId: conversationId,
      previous_message_count: messages.length,
      model: selectedModel
    }, `/chat/${conversationId}`);
  };

  const handleSubmitWithOptions = (e: React.FormEvent<HTMLFormElement>, options?: Parameters<typeof originalHandleSubmit>[1]) => {
    (window as unknown as { lastMessageTime?: number }).lastMessageTime = performance.now();
    
    track('MessageSent', { 
      model: selectedModel, 
      messageLength: input.length,
      conversationId: conversationId
    });
    
    realDataCollector.storeUserEvent('user_message_sent', {
      message_length: input.length,
      model: selectedModel,
      conversationId: conversationId,
      conversation_length: messages.length
    }, `/chat/${conversationId}`);

    originalHandleSubmit(e, options);
  };

  if (isLoadingConversation) {
    return (
      <ChatGPTLayout currentConversationId={conversationId}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#8e8ea0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#8e8ea0]">Loading conversation...</p>
          </div>
        </div>
      </ChatGPTLayout>
    );
  }

  if (!conversationData) {
    return (
      <ChatGPTLayout currentConversationId={conversationId}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#8e8ea0] mb-4">Conversation not found</p>
            <Button 
              onClick={() => router.push('/chat')}
              className="bg-white text-black hover:bg-gray-200"
            >
              Start New Chat
            </Button>
          </div>
        </div>
      </ChatGPTLayout>
    );
  }

  return (
    <ChatGPTLayout currentConversationId={conversationId}>
      <ChatMainArea title={conversationData.title}>
        <ChatMessages messages={messages} />
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
      </ChatMainArea>
    </ChatGPTLayout>
  );
} 