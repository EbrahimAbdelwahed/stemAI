import React, { FormEvent, useRef, useEffect, useState } from 'react';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop?: () => void;

  disabled?: boolean;
  // New props for consolidated controls
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  onFileUpload?: (files: File[]) => void;
  isUploading?: boolean;
}

const models = [
  { id: 'grok-3-mini', name: 'Grok-3-Mini', icon: '🤖' },
  { id: 'gemini-1.5-flash-latest', name: 'Gemini Flash', icon: '💎' },
  { id: 'gpt-4o', name: 'GPT-4o', icon: '🧠' },
  { id: 'claude-3-haiku-20240307', name: 'Claude Haiku', icon: '🌸' },
];

export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,

  disabled = false,
  selectedModel = 'grok-3-mini',
  onModelChange,
  onFileUpload,
  isUploading = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFileUpload) {
      const filesArray = Array.from(e.target.files);
      onFileUpload(filesArray);
      setShowFileDropdown(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onFileUpload) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFileUpload(filesArray);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="relative"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-50">
          <div className="text-blue-400 text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium">Drop files here to upload</p>
          </div>
        </div>
      )}

      {/* Main input container */}
      <div className={`flex items-end gap-2 p-3 bg-white dark:bg-neutral-800 rounded-lg border transition-all duration-200 ${
        isFocused 
          ? 'border-blue-500 ring-2 ring-blue-500/20' 
          : isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
      }`}>
        
        {/* Left controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* File upload button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFileDropdown(!showFileDropdown)}
              className={`p-2 rounded-md transition-all duration-200 ${
                isUploading || showFileDropdown
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-neutral-500 hover:text-blue-600 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
              title="Upload files"
              disabled={disabled || isLoading}
            >
              {isUploading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )}
            </button>

            {/* File upload dropdown */}
            {showFileDropdown && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50">
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Choose files
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">PDF, TXT, DOC, DOCX, Images</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Model selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className={`p-2 rounded-md transition-all duration-200 flex items-center gap-1 ${
                showModelDropdown
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-neutral-500 hover:text-blue-600 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
              title={`Current model: ${currentModel.name}`}
              disabled={disabled || isLoading}
            >
              <span className="text-sm">{currentModel.icon}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Model dropdown */}
            {showModelDropdown && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50">
                <div className="p-1">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        onModelChange?.(model.id);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                        model.id === selectedModel
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                      }`}
                    >
                      <span>{model.icon}</span>
                      <span className="font-medium">{model.name}</span>
                      {model.id === selectedModel && (
                        <svg className="w-4 h-4 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent border-0 focus:outline-none resize-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 min-h-[24px] max-h-[200px]"
            rows={1}
            placeholder="Ask anything about science, technology, engineering, or mathematics..."
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
          
          {/* Character count */}
          {input.length > 0 && (
            <div className="absolute right-0 bottom-0 text-xs text-neutral-400">
              {input.length}
            </div>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Submit/Stop button */}
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              </svg>
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || disabled}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </button>
          )}
        </div>
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="text-xs text-neutral-500">
          {isUploading ? 'Uploading files...' : 'Shift+Enter for new line'}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Click outside handlers */}
      {(showModelDropdown || showFileDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowModelDropdown(false);
            setShowFileDropdown(false);
          }}
        />
      )}
    </form>
  );
} 