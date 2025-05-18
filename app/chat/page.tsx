'use client';

import { useState, useEffect } from 'react';
import { useChat, Message } from '@ai-sdk/react';
import ModelSelector from '../../components/ModelSelector';
import ChatInput from '../../components/ChatInput';
import ChatMessages from '../../components/ChatMessages';
import FileUploader from '../../components/FileUploader';

type ModelType = 'grok-3-mini' | 'gemini-2-flask';

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('grok-3-mini');
  const [isUploading, setIsUploading] = useState(false);
  
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
      model: selectedModel
    },
    id: 'stem-ai-chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I\'m your STEM AI Assistant. Ask me anything about science, technology, engineering, or mathematics.'
      }
    ],
    maxSteps: 5, // Allow multiple steps for tools
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  // Implement manual persistence using localStorage
  useEffect(() => {
    // Save messages to localStorage whenever they change
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem('stem-ai-chat-history', JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [messages]);

  // Load saved messages on initial component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedMessages = localStorage.getItem('stem-ai-chat-history');
        if (savedMessages && savedMessages !== 'undefined') {
          const parsedMessages = JSON.parse(savedMessages);
          // Only set if there are saved messages and not just the initial welcome message
          if (parsedMessages && parsedMessages.length > 1) {
            setMessages(parsedMessages);
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  const onModelChange = (model: ModelType) => {
    setSelectedModel(model);
    
    // Add a system message announcing the model change
    append({
      id: Date.now().toString(),
      role: 'assistant',
      content: `Switching to ${model === 'grok-3-mini' ? 'Grok-3-Mini' : 'Gemini 2.0 Flash'} model. How can I help you?`
    });
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    const uploadingMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: `Processing ${files.length} file(s)...`
    };
    
    // Show a temporary message
    setMessages([...messages, uploadingMessage]);
    
    let successCount = 0;
    let failCount = 0;
    const fileDetails: string[] = [];
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Display the file name in the message for better UX
        fileDetails.push(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        
        // Add a small timeout to show that each file is being processed
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const response = await fetch('/api/documents', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          console.error(`Error uploading file: ${result.error}`);
        }
      } catch (error) {
        failCount++;
        console.error('Error uploading file:', error);
      }
    }
    
    // Replace the uploading message with final status
    setMessages(messages => 
      messages.map(msg => 
        msg.id === uploadingMessage.id 
          ? {
              id: Date.now().toString(),
              role: 'assistant' as const,
              content: successCount > 0 
                ? `Successfully processed ${successCount} file(s)${failCount > 0 ? ` (${failCount} failed)` : ''}.\n\nFiles: \n${fileDetails.join('\n')}\n\nYou can now ask questions about the content.`
                : `Sorry, there was an error processing your files. Please try again.`
            }
          : msg
      )
    );
    
    setIsUploading(false);
  };

  // Clear chat history function that also clears localStorage
  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Chat history cleared. How can I help you with STEM topics today?'
      }]);
      
      // Also clear from localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('stem-ai-chat-history');
        } catch (error) {
          console.error('Error clearing chat history from localStorage:', error);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">STEM AI Assistant</h1>
          <div className="flex items-center space-x-4">
            {isLoading && (
              <button 
                onClick={stop}
                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                aria-label="Stop generating"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Stop
                </span>
              </button>
            )}
            <button
              onClick={handleClearChat}
              className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
              aria-label="Clear chat"
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Chat
              </span>
            </button>
            <ModelSelector 
              selectedModel={selectedModel} 
              onModelChange={onModelChange} 
            />
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden flex flex-col container mx-auto max-w-4xl">
        <div className="flex-1 overflow-y-auto p-4">
          <ChatMessages messages={messages as any} />
          
          {isLoading && (
            <div className="flex justify-start mt-2">
              <div className="max-w-3xl p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 shadow-md">
          <FileUploader 
            onUpload={handleFileUpload} 
            isUploading={isUploading} 
          />
          <ChatInput 
            input={input} 
            handleInputChange={handleInputChange} 
            handleSubmit={handleSubmit} 
            isLoading={isLoading}
            stop={stop}
          />
          {error && (
            <div className="mt-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-300 p-3 rounded-md text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium">Error: {error.message}</p>
                <button 
                  onClick={() => reload()}
                  className="mt-1 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 