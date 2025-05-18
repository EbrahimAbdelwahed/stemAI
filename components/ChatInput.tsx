import React, { FormEvent, useRef, useEffect, useState } from 'react';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop?: () => void;
}

export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to the scrollHeight
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-end gap-2 relative"
    >
      <div className={`flex-1 relative transition-all duration-200 ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
        <textarea
          ref={textareaRef}
          className="w-full p-3 pr-12 rounded-lg border border-gray-300 focus:outline-none resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[44px] max-h-[200px] shadow-sm transition-all"
          rows={1}
          placeholder="Ask a STEM question..."
          value={input}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (input.trim()) {
                handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
              }
            }
          }}
          disabled={isLoading}
        />
        
        {/* Character count and tips */}
        <div className="absolute right-2 bottom-2 text-xs text-gray-400 flex items-center">
          {input.length > 0 && (
            <>
              <span className={`transition-colors ${input.length > 1000 ? 'text-yellow-500' : ''}`}>
                {input.length}
              </span>
              <span className="mx-1">•</span>
            </>
          )}
          <span>Shift+Enter for new line</span>
        </div>
      </div>
      
      {isLoading ? (
        <button
          type="button"
          onClick={stop}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 h-[44px] min-w-[80px] shadow-sm flex items-center justify-center transition-colors"
        >
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Stop
        </button>
      ) : (
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 h-[44px] min-w-[80px] shadow-sm flex items-center justify-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Send
        </button>
      )}
      
      {/* Micro animations to improve feel */}
      {isLoading && (
        <div className="absolute -top-6 left-0 right-0 flex justify-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs py-1 px-2 rounded-full flex items-center animate-pulse">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI is responding...
          </div>
        </div>
      )}
    </form>
  );
} 