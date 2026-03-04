'use client';

import React, { FormEvent, useRef, useEffect, useCallback } from 'react';
import { ArrowUp, Square, Paperclip } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { Tooltip } from './ui/tooltip';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop?: () => void;
  disabled?: boolean;
  onFileUpload?: (files: File[]) => void;
  isUploading?: boolean;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  disabled = false,
  onFileUpload,
  isUploading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (input.trim() && !isLoading && !disabled) {
          handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
        }
      }
    },
    [input, isLoading, disabled, handleSubmit]
  );

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFileUpload) {
      onFileUpload(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex flex-col rounded-2xl border bg-background shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-1 focus-within:ring-ring/20">
          <textarea
            ref={textareaRef}
            className={cn(
              'flex w-full resize-none bg-transparent px-4 pt-4 pb-2 text-sm placeholder:text-muted-foreground focus:outline-none',
              'min-h-[52px] max-h-[200px]'
            )}
            rows={1}
            placeholder="Ask about STEM topics, molecules, physics..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
          />

          {/* Action bar */}
          <div className="flex items-center justify-between px-3 pb-2.5">
            <div className="flex items-center gap-1">
              {onFileUpload && (
                <Tooltip content="Attach file">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    onClick={handleFileClick}
                    disabled={isLoading || disabled || isUploading}
                  >
                    <Paperclip className="size-4" />
                  </Button>
                </Tooltip>
              )}
            </div>

            <div className="flex items-center gap-1">
              {isLoading ? (
                <Tooltip content="Stop generating">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="size-8 rounded-full"
                    onClick={stop}
                  >
                    <Square className="size-3 fill-current" />
                  </Button>
                </Tooltip>
              ) : (
                <Tooltip content="Send message">
                  <Button
                    type="submit"
                    size="icon"
                    className="size-8 rounded-full"
                    disabled={!input.trim() || disabled}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          multiple
          accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.txt,.doc,.docx"
          disabled={isLoading || disabled || isUploading}
        />
      </form>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        AI can make mistakes. Consider checking important information.
      </p>
    </div>
  );
}
