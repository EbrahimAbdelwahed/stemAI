'use client';

import React, { useState } from 'react';

interface ThinkingTracesArtifactProps {
  reasoning: string;
  reasoningDetails?: Array<{ type: 'text' | 'redacted'; text?: string }>;
  metadata?: {
    tokenCount?: number;
    reasoningTime?: number;
  };
}

export function ThinkingTracesArtifact({ 
  reasoning, 
  reasoningDetails, 
  metadata 
}: ThinkingTracesArtifactProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reasoning);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const previewText = reasoning.slice(0, 100) + (reasoning.length > 100 ? '...' : '');

  return (
    <div className="thinking-traces-artifact border border-purple-500/30 bg-purple-500/5 rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-purple-400">🧠</span>
          <span className="text-sm font-medium text-purple-300">Thinking Traces</span>
          {metadata?.tokenCount && (
            <span className="text-xs text-purple-400/70">
              {metadata.tokenCount} tokens
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors px-2 py-1 rounded"
            title="Copy thinking traces"
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors px-2 py-1 rounded"
            title={isExpanded ? 'Collapse thinking traces' : 'Expand thinking traces'}
          >
            {isExpanded ? '▼ Collapse' : '▶ Expand'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-all duration-200 ${isExpanded ? 'max-h-none' : 'max-h-20 overflow-hidden'}`}>
        {isExpanded ? (
          <pre className="text-sm text-purple-100 whitespace-pre-wrap font-mono bg-purple-900/20 p-3 rounded border border-purple-500/20 overflow-auto max-h-96">
            {reasoning}
          </pre>
        ) : (
          <p className="text-sm text-purple-200/80">
            {previewText}
          </p>
        )}
      </div>

      {/* Metadata Footer */}
      {metadata?.reasoningTime && (
        <div className="mt-3 pt-2 border-t border-purple-500/20">
          <span className="text-xs text-purple-400/70">
            Reasoning time: {metadata.reasoningTime}ms
          </span>
        </div>
      )}
    </div>
  );
} 