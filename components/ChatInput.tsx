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
    <div className="border-t border-[#4d4d4d] bg-[#212121] sticky bottom-0">
      <div className="max-w-4xl mx-auto p-4">
        <form 
          onSubmit={handleSubmit} 
          className="relative"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center z-50">
              <div className="text-blue-400 text-center">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium">Drop files here to upload</p>
              </div>
            </div>
          )}

          {/* Main input container - ChatGPT style */}
          <div className={`flex items-end gap-3 p-4 bg-[#2f2f2f] rounded-xl border transition-all duration-200 ${
            isFocused 
              ? 'border-[#565869] ring-2 ring-[#565869]/20' 
              : isDragging 
                ? 'border-blue-500 bg-blue-50/5'
                : 'border-[#4d4d4d] hover:border-[#565869]'
          }`}>
            
            {/* File upload button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFileDropdown(!showFileDropdown)}
                className={`p-2 rounded-lg transition-colors ${
                  isUploading || showFileDropdown
                    ? 'text-blue-400 bg-blue-900/30'
                    : 'text-[#8e8ea0] hover:text-white hover:bg-[#3f3f3f]'
                }`}
                title="Upload files"
                disabled={disabled || isLoading}
              >
                {isUploading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                )}
              </button>

              {/* File upload dropdown */}
              {showFileDropdown && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#2f2f2f] rounded-lg shadow-lg border border-[#4d4d4d] z-50">
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-left px-3 py-2 text-sm text-[#c5c5d2] hover:bg-[#3f3f3f] rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Choose files
                      </div>
                      <div className="text-xs text-[#8e8ea0] mt-1">PDF, TXT, DOC, DOCX, Images</div>
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
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                  showModelDropdown
                    ? 'text-blue-400 bg-blue-900/30'
                    : 'text-[#8e8ea0] hover:text-white hover:bg-[#3f3f3f]'
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
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#2f2f2f] rounded-lg shadow-lg border border-[#4d4d4d] z-50">
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
                            ? 'bg-blue-900/30 text-blue-300'
                            : 'text-[#c5c5d2] hover:bg-[#3f3f3f]'
                        }`}
                      >
                        <span>{model.icon}</span>
                        <span className="font-medium">{model.name}</span>
                        {model.id === selectedModel && (
                          <svg className="w-4 h-4 ml-auto text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Message STEM AI..."
              className="flex-1 min-h-[24px] max-h-[200px] bg-transparent text-white placeholder-[#8e8ea0] resize-none focus:outline-none leading-relaxed"
              rows={1}
              disabled={disabled}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) {
                    handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
                  }
                }
              }}
            />

            {/* Send button - ChatGPT style */}
            <button
              type="submit"
              disabled={disabled || isLoading || !input.trim()}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                input.trim() && !disabled && !isLoading
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-[#4d4d4d] text-[#8e8ea0] cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.gif,.svg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </form>
      </div>
    </div>
  );
} 