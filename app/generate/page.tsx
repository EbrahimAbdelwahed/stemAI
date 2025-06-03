'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import SplitPane from '../../components/SplitPane';
import NavBar from '../../components/NavBar';
import EnhancedChatInput from '../../components/EnhancedChatInput';
import ConversationView from '../../components/ConversationView';
import CodePreview from '../../components/CodePreview';
import { RealDataCollector } from '../../lib/analytics/real-data-collector';

type ModelType = 'grok-3-mini' | 'gemini-1.5-flash-latest' | 'o4-mini';

export default function GeneratePage() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('grok-3-mini');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [generatedJSX, setGeneratedJSX] = useState<string>('');
  // Component name is tracked in componentsGenerated array
  const [sessionStartTime] = useState<number>(Date.now());
  const realDataCollector = RealDataCollector.getInstance();
  const [componentsGenerated, setComponentsGenerated] = useState<{
    name: string;
    code: string;
    jsx?: string;
    timestamp: string;
  }[]>([]);
  
  // Use the chat hook
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    reload, 
    stop, 
    error, 
    setMessages,
    append
  } = useChat({
    api: '/api/chat',
    body: {
      model: selectedModel,
      mode: 'generate'
    },
    id: 'stem-ai-generate',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Describe a UI component you want me to create with React and Tailwind CSS.'
      }
    ],
    onFinish: (message) => {
      // Look for tool invocations
      const toolCall = message.toolInvocations?.find(tool => 
        tool.toolName === 'generateReactComponent' && tool.state === 'result'
      );
      
      if (toolCall?.state === 'result') {
        const result = toolCall.result as any;
        setGeneratedCode(result.jsx || '');
        setGeneratedJSX(result.jsx || '');
        
        const newComponent = {
          name: result.componentName || 'Component',
          code: result.jsx || '',
          jsx: result.jsx,
          timestamp: result.timestamp || new Date().toISOString()
        };
        // Add to generated components
        setComponentsGenerated(prev => [ newComponent, ...prev]);

        // Track UI generation success
        realDataCollector.storeUserEvent('ui_generation_completed', {
          component_name: newComponent.name,
          code_length: newComponent.code.length,
          model: selectedModel,
          session_duration: Date.now() - sessionStartTime,
          request_message_id: message.id
        }, '/generate');
      } else {
        // Track UI generation failure or non-tool response
        realDataCollector.storeUserEvent('ui_generation_failed', {
          model: selectedModel,
          error_message: message.content || 'No tool result found',
          session_duration: Date.now() - sessionStartTime,
          request_message_id: message.id
        }, '/generate');
      }
    }
  });

  useEffect(() => {
    // Track page view for generate page
    realDataCollector.storePageView('/generate', document.referrer, navigator.userAgent);
    // Track session start
    realDataCollector.storeUserEvent('generate_session_started', {
      model: selectedModel,
      start_time: sessionStartTime
    }, '/generate');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModelChange = (model: ModelType) => {
    const previousModel = selectedModel;
    // Add a system message announcing the model change
    append({
      id: Date.now().toString(),
      role: 'assistant',
      content: `Switching to ${model === 'grok-3-mini' ? 'Grok-3-Mini' : model === 'gemini-1.5-flash-latest' ? 'Gemini 2.0 Flash' : 'O4-Mini'} model. Describe a component you want me to create.`
    });

    // Track model change event
    realDataCollector.storeUserEvent('generate_model_changed', {
      new_model: model,
      previous_model: previousModel, // Use the captured previousModel
      session_duration: Date.now() - sessionStartTime,
      conversation_length: messages.length
    }, '/generate');
    setSelectedModel(model); // Correctly set the new model
  };

  const handleNewChat = () => {
    if (messages.length > 1) {
      if (window.confirm('Start a new design session? This will clear the current conversation.')) {
        // Track old session end
        realDataCollector.storeUserEvent('generate_session_ended', {
          model: selectedModel,
          session_duration: Date.now() - sessionStartTime,
          components_generated_count: componentsGenerated.length,
          conversation_length: messages.length,
          end_reason: 'user_cleared'
        }, '/generate');
        
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: 'Describe a UI component you want me to create with React and Tailwind CSS.'
        }]);
        setGeneratedCode('');
        setGeneratedJSX('');
        setComponentsGenerated([]); // Clear generated components
        // Potentially reset sessionStartTime here if a new session implies a new start time for duration calculations.
        // For now, we'll assume sessionStartTime is for the entire page lifecycle.

        // Track new session start
        realDataCollector.storeUserEvent('generate_session_started', {
          model: selectedModel, // Model might have changed, so use current selectedModel
          start_time: Date.now() // Use current time for new session
        }, '/generate');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <NavBar 
        selectedModel={selectedModel} 
        onModelChange={handleModelChange}
        onNewChat={handleNewChat}
      />
      
      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="overflow-hidden flex-1">
              <ConversationView 
                messages={messages} 
                isLoading={isLoading} 
              />
            </div>
            <EnhancedChatInput
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              placeholder="Describe a UI component or pattern..."
              stop={stop}
            />
          </div>
        }
        right={
          <CodePreview
            code={generatedCode}
            jsx={generatedJSX}
          />
        }
      />
      
      {error && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-600 text-white rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Error: {error.message}</p>
              <button 
                onClick={() => reload()}
                className="text-sm mt-1 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 