'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
// Using inline SVG icons to match project pattern

interface StreamingMarkdownProps {
  text: string;
  className?: string;
  speed?: number;
}

export function StreamingMarkdown({ 
  text, 
  className = '', 
  speed = 30
}: StreamingMarkdownProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Stream the text character by character
  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [text, currentIndex, speed]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Memoized markdown components for performance
  const markdownComponents = useMemo(() => ({
    // Enhanced code block rendering with copy functionality
    code({ className, children, ...props }: { className?: string; children: React.ReactNode; [key: string]: unknown }) {
      const inline = !className;
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      
      if (!inline && match) {
        return (
          <div className="relative group my-4">
            <button
              onClick={() => handleCopyCode(codeString)}
              className="absolute top-3 right-3 p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Copy code"
            >
              {copiedCode === codeString ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              className="rounded-lg !bg-gray-900 border border-gray-700"
              customStyle={{
                margin: 0,
                fontSize: '0.875rem',
                lineHeight: '1.5',
                padding: '1rem',
              }}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }
      
      // Inline code
      return (
        <code 
          className="px-1.5 py-0.5 bg-gray-800 text-gray-200 rounded text-sm font-mono border border-gray-700" 
          {...props}
        >
          {children}
        </code>
      );
    },
    
    // Enhanced link handling
    a({ href, children, ...props }) {
      const isExternal = href?.startsWith('http');
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
          {...props}
        >
                     {children}
           {isExternal && (
             <svg className="w-3 h-3 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
             </svg>
           )}
        </a>
      );
    },
    
    // Enhanced headers with proper spacing and hierarchy
    h1({ children, ...props }) {
      return (
        <h1 className="text-3xl font-bold text-gray-100 mb-6 mt-8 border-b border-gray-700 pb-3" {...props}>
          {children}
        </h1>
      );
    },
    
    h2({ children, ...props }) {
      return (
        <h2 className="text-2xl font-semibold text-gray-200 mb-4 mt-6" {...props}>
          {children}
        </h2>
      );
    },
    
    h3({ children, ...props }) {
      return (
        <h3 className="text-xl font-medium text-gray-300 mb-3 mt-5" {...props}>
          {children}
        </h3>
      );
    },
    
    h4({ children, ...props }) {
      return (
        <h4 className="text-lg font-medium text-gray-300 mb-2 mt-4" {...props}>
          {children}
        </h4>
      );
    },
    
    // Enhanced list styling with proper indentation
    ul({ children, ...props }) {
      return (
        <ul className="list-disc list-inside space-y-2 my-4 text-gray-300 ml-4" {...props}>
          {children}
        </ul>
      );
    },
    
    ol({ children, ...props }) {
      return (
        <ol className="list-decimal list-inside space-y-2 my-4 text-gray-300 ml-4" {...props}>
          {children}
        </ol>
      );
    },
    
    li({ children, ...props }) {
      return (
        <li className="text-gray-300 leading-relaxed pl-2" {...props}>
          {children}
        </li>
      );
    },
    
    // Enhanced paragraph styling
    p({ children, ...props }) {
      return (
        <p className="text-gray-300 leading-relaxed mb-4" {...props}>
          {children}
        </p>
      );
    },
    
    // Enhanced blockquote styling
    blockquote({ children, ...props }) {
      return (
        <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-gray-800/50 rounded-r text-gray-300 italic" {...props}>
          {children}
        </blockquote>
      );
    },
    
    // Enhanced table styling
    table({ children, ...props }) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full border border-gray-700 rounded-lg overflow-hidden" {...props}>
            {children}
          </table>
        </div>
      );
    },
    
    thead({ children, ...props }) {
      return (
        <thead className="bg-gray-800" {...props}>
          {children}
        </thead>
      );
    },
    
    th({ children, ...props }) {
      return (
        <th className="px-4 py-3 text-left text-gray-200 font-semibold border-b border-gray-700" {...props}>
          {children}
        </th>
      );
    },
    
    td({ children, ...props }) {
      return (
        <td className="px-4 py-3 text-gray-300 border-b border-gray-700" {...props}>
          {children}
        </td>
      );
    },
    
    // Enhanced math styling
    span({ className, children, ...props }) {
      if (className === 'math math-inline') {
        return (
          <span 
            className="px-2 py-1 bg-blue-900/30 rounded border border-blue-600/30 font-mono text-blue-200" 
            {...props}
          >
            {children}
          </span>
        );
      }
      return <span className={className} {...props}>{children}</span>;
    },
    
    // Enhanced strong/em styling
    strong({ children, ...props }) {
      return (
        <strong className="font-bold text-gray-100" {...props}>
          {children}
        </strong>
      );
    },
    
    em({ children, ...props }) {
      return (
        <em className="italic text-gray-200" {...props}>
          {children}
        </em>
      );
    },
  }), [copiedCode]);

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={markdownComponents}
      >
        {displayedText}
      </ReactMarkdown>
      
      {/* Animated cursor for streaming effect */}
      {!isComplete && (
        <span className="inline-block w-2 h-5 bg-blue-400 animate-pulse ml-1" />
      )}
    </div>
  );
} 