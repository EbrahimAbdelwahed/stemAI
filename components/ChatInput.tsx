import React, { FormEvent, useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for heavy components
const MathInput = dynamic(() => import('./MathInput'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded"></div>
});

const MarkdownRenderer = dynamic(() => import('./MarkdownRenderer'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded"></div>
});

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop?: () => void;
  reload?: () => void;
  disabled?: boolean;
}

export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  reload,
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showMathInput, setShowMathInput] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Math insertion function
  const handleMathInsert = (mathText: string) => {
    const newValue = input + mathText;
    handleInputChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>);
    setShowMathInput(false);
  };

  return (
    <div className="space-y-2">
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col gap-2 relative"
      >
        {/* Main input area */}
        <div className="flex items-end gap-2">
          <div className={`flex-1 relative transition-all duration-200 ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
            <textarea
              ref={textareaRef}
              className="w-full p-3 pr-12 rounded-lg border border-gray-300 focus:outline-none resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[44px] max-h-[200px] shadow-sm transition-all"
              rows={1}
              placeholder="Ask a STEM question, use markdown formatting, or insert math expressions..."
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
              disabled={isLoading || disabled}
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
          
          {/* Toolbar buttons */}
          <div className="flex items-center gap-1 mb-11">
            <button
              type="button"
              onClick={() => setShowMathInput(!showMathInput)}
              className={`p-2 rounded transition-colors ${
                showMathInput 
                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Insert math expression"
            >
              <MathIcon className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded transition-colors ${
                showPreview 
                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Preview markdown"
            >
              <PreviewIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Submit/Stop button */}
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
              disabled={isLoading || !input.trim() || disabled}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 h-[44px] min-w-[80px] shadow-sm flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </button>
          )}
        </div>
        
        {/* Loading indicator */}
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

      {/* Math Input Panel */}
      {showMathInput && (
        <div className="mt-2">
          <MathInput onInsert={handleMathInsert} />
        </div>
      )}

      {/* Preview Panel */}
      {showPreview && input && (
        <div className="mt-2 p-3 border rounded bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview:</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          <MarkdownRenderer content={input} darkMode={true} />
        </div>
      )}
    </div>
  );
}

// Helper Icon Components
const MathIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const PreviewIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
); 