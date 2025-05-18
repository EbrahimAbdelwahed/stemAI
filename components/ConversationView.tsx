import React from 'react';
import { Message } from '@ai-sdk/react';

interface ConversationViewProps {
  messages: Message[];
  isLoading?: boolean;
}

export default function ConversationView({ messages, isLoading = false }: ConversationViewProps) {
  // Helper function to format code blocks
  const formatMessageContent = (content: string) => {
    if (!content) return null;
    
    // Regex to match code blocks
    const codeBlockRegex = /```(.+?)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before the code block
      if (match.index > lastIndex) {
        parts.push(
          <div key={lastIndex} className="whitespace-pre-wrap">
            {content.substring(lastIndex, match.index)}
          </div>
        );
      }
      
      // Add the code block
      const language = match[1] ? match[1].trim() : '';
      const code = match[2];
      
      parts.push(
        <div key={match.index} className="my-2 overflow-x-auto rounded-md">
          <div className="flex items-center justify-between bg-gray-800 px-4 py-1.5 text-xs text-gray-400">
            <span>{language || 'code'}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Copy code"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
              </svg>
            </button>
          </div>
          <pre className="p-4 overflow-auto text-sm text-gray-300 bg-gray-900">
            <code>{code}</code>
          </pre>
        </div>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text after the last code block
    if (lastIndex < content.length) {
      parts.push(
        <div key={lastIndex} className="whitespace-pre-wrap">
          {content.substring(lastIndex)}
        </div>
      );
    }
    
    return parts.length > 0 ? parts : <div className="whitespace-pre-wrap">{content}</div>;
  };

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex space-x-1 mt-1">
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '300ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '600ms' }}></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex items-start ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {formatMessageContent(message.content)}
              
              {/* Show toolInvocations if they exist */}
              {message.toolInvocations?.map((tool, index) => (
                <div 
                  key={`${message.id}-tool-${index}`}
                  className="mt-3 rounded border border-gray-700 bg-gray-900 p-3"
                >
                  <div className="flex items-center text-xs text-gray-400 mb-2">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="mr-1"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                    <span>{tool.toolName}</span>
                  </div>
                  {tool.state === 'result' && (
                    <pre className="text-xs overflow-auto whitespace-pre-wrap">
                      {JSON.stringify(tool.result, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start justify-start">
            <div className="max-w-[80%] rounded-lg p-4 bg-gray-800 text-gray-100">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 