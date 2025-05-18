import React from 'react';
import { Message } from 'ai';

interface ChatMessagesProps {
  messages: Message[];
}

// Custom handling for tool invocation structure
interface ToolCall {
  name?: string;
  tool?: string;
  parameters?: Record<string, any>;
  input?: Record<string, any>;
  result?: any;
}

// Custom message part for images
interface ImagePart {
  type: 'image';
  image: {
    url: string;
    alt?: string;
  }
}

// Extended message part that includes our custom types
type ExtendedMessagePart = 
  | { type: 'text'; text: string }
  | { type: 'tool-invocation'; toolInvocation: any }
  | { type: 'reasoning'; reasoning: string }
  | ImagePart;

// Extended message type with our custom parts
interface ExtendedMessage extends Omit<Message, 'parts'> {
  parts?: ExtendedMessagePart[];
}

export default function ChatMessages({ messages }: { messages: ExtendedMessage[] }) {
  // Function to format code blocks
  const formatContent = (content: string) => {
    if (!content) return null;
    
    // Regex to match code blocks
    const codeBlockRegex = /```(.+?)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before the code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {content.slice(lastIndex, match.index)}
          </span>
        );
      }
      
      // Add the code block
      const language = match[1].trim();
      const code = match[2];
      parts.push(
        <div key={`code-${match.index}`} className="my-2 overflow-hidden rounded-md">
          <div className="bg-gray-800 px-4 py-1 text-xs text-gray-200">
            {language}
          </div>
          <pre className="bg-gray-900 p-4 overflow-auto text-gray-300 text-sm">
            <code>{code}</code>
          </pre>
        </div>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {content.slice(lastIndex)}
        </span>
      );
    }
    
    return parts.length > 0 ? parts : <span className="whitespace-pre-wrap">{content}</span>;
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-3xl p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
            }`}
          >
            <div className="text-sm font-semibold mb-1">
              {message.role === 'user' ? 'You' : 'AI Assistant'}
            </div>
            {message.content ? (
              <div>{formatContent(message.content)}</div>
            ) : (
              <div>
                {message.parts?.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return <div key={`${message.id}-${i}`}>{formatContent(part.text)}</div>;
                    case 'tool-invocation':
                      const toolCall = part.toolInvocation as unknown as ToolCall;
                      const toolName = toolCall.name || toolCall.tool || 'unknown';
                      const toolInput = toolCall.input || toolCall.parameters;
                      return (
                        <div key={`${message.id}-${i}`} className="my-2 rounded border border-gray-300 dark:border-gray-600 overflow-hidden">
                          <div className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 p-2 flex items-center">
                            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-semibold">Using tool: {toolName}</span>
                          </div>
                          {toolInput && (
                            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2">
                              <div className="font-semibold mb-1">Parameters:</div>
                              <pre className="whitespace-pre-wrap overflow-auto">
                                {JSON.stringify(toolInput, null, 2)}
                              </pre>
                            </div>
                          )}
                          {toolCall.result && (
                            <div className="text-xs font-mono bg-green-50 dark:bg-green-900/20 p-2">
                              <div className="font-semibold mb-1 flex items-center">
                                <svg className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Result:
                              </div>
                              <pre className="whitespace-pre-wrap overflow-auto">
                                {JSON.stringify(toolCall.result, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    case 'reasoning':
                      return (
                        <div key={`${message.id}-${i}`} className="my-2 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded italic border border-yellow-200 dark:border-yellow-800/50">
                          <div className="text-xs font-semibold mb-1 flex items-center">
                            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Reasoning:
                          </div>
                          <div className="whitespace-pre-wrap">{part.reasoning}</div>
                        </div>
                      );
                    case 'image':
                      // Support for image responses
                      return (
                        <div key={`${message.id}-${i}`} className="my-2">
                          <img 
                            src={part.image?.url} 
                            alt={part.image?.alt || "Generated image"} 
                            className="max-w-full rounded-md shadow-md"
                          />
                          {part.image?.alt && (
                            <div className="text-xs text-gray-500 mt-1">{part.image.alt}</div>
                          )}
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            )}
          </div>
        </div>
      ))}
      {messages.length === 0 && (
        <div className="text-center py-12 text-gray-500 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-lg font-medium mt-2">Welcome to the STEM AI Assistant!</p>
          <p className="mt-1">Ask me anything about science, technology, engineering, or math.</p>
        </div>
      )}
    </div>
  );
} 