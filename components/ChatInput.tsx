import React, { FormEvent, useRef, useEffect, useState, useMemo, ChangeEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send, X, Bot, ChevronDown, Zap } from 'lucide-react';
import { useAppStore } from '@/lib/store/app-store';

const models = [
  { id: 'grok-3-mini', name: 'Grok 3 Mini', provider: 'xAI' },
  { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', provider: 'Google' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'Anthropic' },
  { id: 'o4-mini', name: 'Command R+', provider: 'Cohere' },
];

interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>, options?: any) => void;
  isLoading: boolean;
  stop?: () => void;
  disabled?: boolean;
  onFileUpload?: (files: File[]) => void;
}

export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  disabled = false,
  onFileUpload,
}: ChatInputProps) {
  const { selectedModel, setSelectedModel, isUploading } = useAppStore(state => ({
    selectedModel: state.selectedModel,
    setSelectedModel: state.setSelectedModel,
    isUploading: state.isUploading,
  }));
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = (acceptedFiles: File[]) => {
    setAttachedFiles(prev => [...prev, ...acceptedFiles]);
    onFileUpload?.(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setIsModelDropdownOpen(false);
  };

  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <div {...getRootProps()} className={`relative bg-background-secondary p-4 rounded-lg border ${isDragActive ? 'border-primary' : 'border-border'}`}>
      <input {...getInputProps()} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() && attachedFiles.length === 0) return;
          handleSubmit(e);
          setAttachedFiles([]);
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-start gap-4">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question or describe a task..."
            className="flex-1 resize-none bg-background border-none focus:ring-0"
            rows={1}
            disabled={disabled || isUploading}
          />
          <Button type="submit" size="icon" disabled={isLoading || disabled || isUploading}>
            <Send size={20} />
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <Paperclip size={16} />
              Attach
            </Button>
            <div className="relative">
              <Button type="button" size="sm" variant="ghost" onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}>
                <Bot size={16} />
                {currentModel.name}
                <ChevronDown size={16} className={`ml-1 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
              {isModelDropdownOpen && (
                <div className="absolute bottom-full mb-2 w-56 bg-background border border-border rounded-lg shadow-lg z-10">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => handleModelSelect(model.id)}
                      className={`w-full text-left px-3 py-2 text-sm flex justify-between items-center hover:bg-muted ${selectedModel === model.id ? 'text-primary' : ''}`}
                    >
                      <span>{model.name}</span>
                      <span className="text-xs text-muted-foreground">{model.provider}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {isLoading && (
            <Button type="button" size="sm" variant="ghost" onClick={stop}>
              <X size={16} />
              Stop
            </Button>
          )}
        </div>
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                <span className="text-sm">{file.name}</span>
                <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveFile(index)}>
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
