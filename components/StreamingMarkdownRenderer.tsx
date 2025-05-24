'use client';

import React, { memo, useMemo, useRef, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface StreamingMarkdownRendererProps {
  content: string;
  messageId: string;
  isStreaming?: boolean;
  className?: string;
  darkMode?: boolean;
}

// Cache for completed message blocks
const messageCache = new Map<string, React.ReactElement>();

// Helper function to detect if content appears complete
function isContentComplete(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;
  
  // Check for common completion patterns
  const endsWithPunctuation = /[.!?]$/.test(trimmed);
  const endsWithCodeBlock = /```\s*$/.test(trimmed);
  const endsWithMath = /\$\$\s*$/.test(trimmed);
  
  return endsWithPunctuation || endsWithCodeBlock || endsWithMath;
}

// Split content into stable blocks (paragraphs, code blocks, etc.)
function splitIntoBlocks(content: string): string[] {
  const blocks: string[] = [];
  let currentBlock = '';
  let inCodeBlock = false;
  let inMathBlock = false;
  
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track code block boundaries
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }
    
    // Track math block boundaries
    if (line.trim().startsWith('$$')) {
      inMathBlock = !inMathBlock;
    }
    
    currentBlock += line + '\n';
    
    // End block on double newline (paragraph break) unless in code/math block
    if (!inCodeBlock && !inMathBlock) {
      if (line.trim() === '' && currentBlock.trim() !== '') {
        blocks.push(currentBlock.trim());
        currentBlock = '';
      }
    }
  }
  
  // Add remaining content as final block
  if (currentBlock.trim()) {
    blocks.push(currentBlock.trim());
  }
  
  return blocks;
}

const StreamingMarkdownRenderer = memo(({ 
  content, 
  messageId, 
  isStreaming = false,
  className = '',
  darkMode = true 
}: StreamingMarkdownRendererProps) => {
  const previousContentRef = useRef<string>('');
  const cachedBlocksRef = useRef<Map<number, React.ReactElement>>(new Map());
  
  const renderedContent = useMemo(() => {
    const cacheKey = `${messageId}-complete`;
    
    // If not streaming and content is complete, check cache
    if (!isStreaming && isContentComplete(content)) {
      const cached = messageCache.get(cacheKey);
      if (cached) {
        console.log(`[Streaming Markdown] Using cached complete message: ${messageId}`);
        return cached;
      }
    }
    
    // Split content into blocks for partial caching
    const blocks = splitIntoBlocks(content);
    const renderedBlocks: React.ReactElement[] = [];
    
    blocks.forEach((block, index) => {
      const blockKey = `${messageId}-block-${index}`;
      const blockHash = JSON.stringify(block); // Simple hash for block content
      
      // Check if this block is complete and cached
      const blockComplete = isContentComplete(block);
      const cachedBlock = cachedBlocksRef.current.get(index);
      
      if (blockComplete && cachedBlock) {
        // Use cached complete block
        renderedBlocks.push(cachedBlock);
      } else {
        // Render new block
        const renderedBlock = (
          <div key={blockKey} className="markdown-block">
            <MarkdownRenderer 
              content={block} 
              className=""
              darkMode={darkMode}
            />
          </div>
        );
        
        // Cache complete blocks
        if (blockComplete) {
          cachedBlocksRef.current.set(index, renderedBlock);
        }
        
        renderedBlocks.push(renderedBlock);
      }
    });
    
    const finalElement = <div className={className}>{renderedBlocks}</div>;
    
    // Cache complete messages
    if (!isStreaming && isContentComplete(content)) {
      messageCache.set(cacheKey, finalElement);
      console.log(`[Streaming Markdown] Cached complete message: ${messageId}`);
    }
    
    return finalElement;
  }, [content, messageId, isStreaming, className, darkMode]);
  
  // Clean up cache when content changes significantly
  useEffect(() => {
    const contentChanged = previousContentRef.current !== content;
    if (contentChanged) {
      // Clear block cache if content structure changed significantly
      const previousBlocks = splitIntoBlocks(previousContentRef.current);
      const currentBlocks = splitIntoBlocks(content);
      
      if (previousBlocks.length !== currentBlocks.length) {
        cachedBlocksRef.current.clear();
      }
      
      previousContentRef.current = content;
    }
  }, [content]);
  
  return renderedContent;
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if content actually changed or streaming state changed
  return (
    prevProps.content === nextProps.content &&
    prevProps.isStreaming === nextProps.isStreaming &&
    prevProps.darkMode === nextProps.darkMode &&
    prevProps.className === nextProps.className
  );
});

StreamingMarkdownRenderer.displayName = 'StreamingMarkdownRenderer';

// Utility function to clear the message cache (useful for testing)
export function clearMarkdownCache(): void {
  messageCache.clear();
  console.log('[Streaming Markdown] Cache cleared');
}

// Get cache statistics
export function getMarkdownCacheStats() {
  return {
    size: messageCache.size,
    keys: Array.from(messageCache.keys()),
  };
}

export { StreamingMarkdownRenderer }; 