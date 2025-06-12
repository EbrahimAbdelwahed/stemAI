'use client';

import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface StreamingMarkdownRendererProps {
  content: string;
  messageId: string;
  isStreaming?: boolean;
  className?: string;
  darkMode?: boolean;
}

export default function StreamingMarkdownRenderer({ 
  content, 
  messageId, 
  isStreaming = false,
  className = '',
  darkMode = true 
}: StreamingMarkdownRendererProps) {
  // Only add memo if profiling shows re-rendering issues
  // For now, keep it simple and let React handle optimizations
  
  return (
    <div className={className}>
      <MarkdownRenderer 
        content={content} 
        className=""
        darkMode={darkMode}
      />
    </div>
  );
} 