import React, { useState, useRef, useEffect } from 'react';

interface EnhancedChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  placeholder?: string;
  stop?: () => void;
}

export default function EnhancedChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  placeholder = "Describe a component or UI pattern...",
  stop,
}: EnhancedChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(
        Math.max(textareaRef.current.scrollHeight, 56), // Min height: 56px
        300 // Max height: 300px
      );
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="border-t border-gray-800 bg-gray-900 p-4">
      <form 
        onSubmit={handleSubmit}
        className="relative max-w-3xl mx-auto"
      >
        <div 
          className={`relative rounded-lg border ${
            isFocused 
              ? 'border-blue-500 ring-1 ring-blue-500/20' 
              : 'border-gray-700 hover:border-gray-600'
          } transition-all bg-gray-950`}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              // Submit on Cmd/Ctrl+Enter
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                if (input.trim()) {
                  handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                }
              }
            }}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full resize-none bg-transparent py-3 pl-4 pr-16 text-white focus:outline-none"
            rows={1}
          />
          
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="absolute right-3 bottom-3 rounded-md p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-800"
              title="Stop generating"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`absolute right-3 bottom-3 rounded-md p-1.5 ${
                input.trim() 
                  ? 'text-blue-500 hover:text-blue-400 hover:bg-gray-800' 
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              title="Send message (Ctrl+Enter)"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          )}
        </div>
        
        <div className="mt-2 text-xs text-center text-gray-500">
          {isLoading ? (
            <div className="animate-pulse">Processing your request...</div>
          ) : (
            <div>
              <span className="inline-block">Describe a UI component or pattern you want to create</span>
              <span className="mx-1.5">•</span>
              <span className="inline-block">Press Ctrl+Enter to submit</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
} 