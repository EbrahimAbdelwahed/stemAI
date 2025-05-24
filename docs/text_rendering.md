# Enhanced Text Rendering Implementation Guide

## Overview

This document provides a comprehensive guide for implementing enhanced text rendering capabilities in the STEM AI Assistant, including markdown and LaTeX support. The implementation focuses on improving the user experience by providing rich text formatting, mathematical expressions, and interactive elements.

## Current State Analysis

### Existing Text Rendering
- **Current Implementation**: Basic text rendering with minimal formatting
- **Location**: `components/ChatMessages.tsx` - Line 59-65
- **Current Styling**: Uses `prose prose-sm dark:prose-invert` classes
- **Code Block Support**: Limited code block detection in `ConversationView.tsx`
- **Limitations**: No markdown parsing, no LaTeX support, no interactive elements

### Current Dependencies
- `@tailwindcss/typography`: Already installed for prose styling
- `react-markdown`: Recently installed for markdown parsing
- `remark-gfm`: Recently installed for GitHub Flavored Markdown
- `rehype-highlight`: Recently installed for syntax highlighting
- `react-syntax-highlighter`: Recently installed for enhanced code highlighting

## Implementation Plan

### Phase 1: Enhanced Markdown Rendering Component

#### 1.1 Create MarkdownRenderer Component

**File**: `components/MarkdownRenderer.tsx`

```typescript
'use client';

import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  darkMode?: boolean;
}

const MarkdownRenderer = memo(({ content, className = '', darkMode = true }: MarkdownRendererProps) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          // Custom code block rendering with copy functionality
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            
            if (!inline && match) {
              return (
                <div className="relative group">
                  <button
                    onClick={() => handleCopyCode(codeString)}
                    className="absolute top-2 right-2 p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Copy code"
                  >
                    {copiedCode === codeString ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <CopyIcon className="w-4 h-4" />
                    )}
                  </button>
                  <SyntaxHighlighter
                    style={darkMode ? oneDark : oneLight}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }
            
            // Inline code
            return (
              <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
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
                className="text-blue-600 dark:text-blue-400 hover:underline"
                {...props}
              >
                {children}
                {isExternal && (
                  <ExternalLinkIcon className="w-3 h-3 inline ml-1" />
                )}
              </a>
            );
          },
          
          // Enhanced table styling
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          
          // Math block styling
          div({ className, children, ...props }) {
            if (className === 'math math-display') {
              return (
                <div className="my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-x-auto" {...props}>
                  {children}
                </div>
              );
            }
            return <div className={className} {...props}>{children}</div>;
          },
          
          // Inline math styling
          span({ className, children, ...props }) {
            if (className === 'math math-inline') {
              return (
                <span className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded" {...props}>
                  {children}
                </span>
              );
            }
            return <span className={className} {...props}>{children}</span>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

// Helper Icons
const CopyIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ExternalLinkIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;
```

#### 1.2 Install Additional Dependencies

```bash
npm install remark-math rehype-katex katex
```

#### 1.3 Update Global Styles

**File**: `app/globals.css`

Add KaTeX CSS import and custom math styling:

```css
/* Add to the top of the file */
@import 'katex/dist/katex.min.css';

/* Add to the end of the file */
/* Math styling */
.katex-display {
  margin: 1em 0;
  text-align: center;
}

.katex {
  font-size: 1.1em;
}

/* Enhanced prose styling for markdown */
.prose .katex-display {
  margin: 1.5em auto;
}

.prose code {
  @apply bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-sm;
}

.prose pre {
  @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto;
}

.prose blockquote {
  @apply border-l-4 border-blue-500 pl-4 italic;
}

.prose table {
  @apply border-collapse border border-gray-300 dark:border-gray-600;
}

.prose th, .prose td {
  @apply border border-gray-300 dark:border-gray-600 px-3 py-2;
}

.prose th {
  @apply bg-gray-100 dark:bg-gray-800 font-semibold;
}
```

### Phase 2: Update ChatMessages Component

#### 2.1 Replace Basic Text Rendering

**File**: `components/ChatMessages.tsx`

Update the text rendering section:

```typescript
// Add import
import MarkdownRenderer from './MarkdownRenderer';

// Replace the existing content rendering (lines 59-65) with:
{message.content && (
  <MarkdownRenderer 
    content={formatAndCleanContent(message.content)}
    className="break-words"
    darkMode={true} // You can make this dynamic based on theme
  />
)}
```

#### 2.2 Enhanced Content Cleaning

Update the `formatAndCleanContent` function:

```typescript
function formatAndCleanContent(content: string): string {
  let cleanedContent = content;
  
  // Remove visualization markers
  cleanedContent = cleanedContent.replace(/\[NEEDS_VISUALIZATION:{.*?}\]/g, '');
  
  // Clean up extra whitespace but preserve intentional formatting
  cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Ensure proper math delimiter formatting
  cleanedContent = cleanedContent.replace(/\$\$(.*?)\$\$/g, '$$\n$1\n$$');
  
  return cleanedContent.trim();
}
```

### Phase 3: LaTeX and Mathematical Expression Support

#### 3.1 Math Input Component

**File**: `components/MathInput.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface MathInputProps {
  onInsert: (mathText: string) => void;
}

const MathInput: React.FC<MathInputProps> = ({ onInsert }) => {
  const [mathText, setMathText] = useState('');
  const [mode, setMode] = useState<'inline' | 'block'>('inline');

  const handleInsert = () => {
    const formatted = mode === 'inline' ? `$${mathText}$` : `$$\n${mathText}\n$$`;
    onInsert(formatted);
    setMathText('');
  };

  const commonExpressions = [
    { label: 'Fraction', value: '\\frac{a}{b}' },
    { label: 'Square root', value: '\\sqrt{x}' },
    { label: 'Power', value: 'x^{n}' },
    { label: 'Subscript', value: 'x_{n}' },
    { label: 'Sum', value: '\\sum_{i=1}^{n} x_i' },
    { label: 'Integral', value: '\\int_{a}^{b} f(x) dx' },
    { label: 'Matrix', value: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  ];

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Math Expression</label>
        <textarea
          value={mathText}
          onChange={(e) => setMathText(e.target.value)}
          placeholder="Enter LaTeX math expression..."
          className="w-full p-2 border rounded resize-none dark:bg-gray-700"
          rows={3}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Preview</label>
        <div className="p-3 border rounded bg-gray-50 dark:bg-gray-700 min-h-[60px]">
          {mathText && (
            <MarkdownRenderer 
              content={mode === 'inline' ? `$${mathText}$` : `$$${mathText}$$`}
            />
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('inline')}
            className={`px-3 py-1 rounded ${mode === 'inline' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Inline
          </button>
          <button
            onClick={() => setMode('block')}
            className={`px-3 py-1 rounded ${mode === 'block' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Block
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Common Expressions</label>
        <div className="grid grid-cols-2 gap-2">
          {commonExpressions.map((expr) => (
            <button
              key={expr.label}
              onClick={() => setMathText(expr.value)}
              className="text-left p-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {expr.label}
            </button>
          ))}
        </div>
      </div>
      
      <button
        onClick={handleInsert}
        disabled={!mathText.trim()}
        className="w-full py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        Insert Math
      </button>
    </div>
  );
};

export default MathInput;
```

### Phase 4: Enhanced ChatInput with Rich Text Support

#### 4.1 Update ChatInput Component

**File**: `components/ChatInput.tsx`

Add math input toggle and preview functionality:

```typescript
// Add imports
import { useState } from 'react';
import MathInput from './MathInput';
import MarkdownRenderer from './MarkdownRenderer';

// Add to the ChatInput component
const [showMathInput, setShowMathInput] = useState(false);
const [showPreview, setShowPreview] = useState(false);

// Add math insertion function
const handleMathInsert = (mathText: string) => {
  const newValue = input + mathText;
  handleInputChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>);
  setShowMathInput(false);
};

// Add to the JSX (before the submit button):
<div className="flex items-center gap-2 mt-2">
  <button
    type="button"
    onClick={() => setShowMathInput(!showMathInput)}
    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
    title="Insert math expression"
  >
    <MathIcon className="w-4 h-4" />
  </button>
  
  <button
    type="button"
    onClick={() => setShowPreview(!showPreview)}
    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
    title="Preview markdown"
  >
    <PreviewIcon className="w-4 h-4" />
  </button>
</div>

{showMathInput && (
  <div className="mt-2">
    <MathInput onInsert={handleMathInsert} />
  </div>
)}

{showPreview && input && (
  <div className="mt-2 p-3 border rounded bg-gray-50 dark:bg-gray-800">
    <h3 className="text-sm font-medium mb-2">Preview:</h3>
    <MarkdownRenderer content={input} />
  </div>
)}
```

### Phase 5: Performance Optimizations

#### 5.1 Lazy Loading and Code Splitting

**File**: `components/ChatMessages.tsx`

```typescript
// Use dynamic imports for heavy components
import dynamic from 'next/dynamic';

const MarkdownRenderer = dynamic(() => import('./MarkdownRenderer'), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded"></div>,
  ssr: false
});
```

#### 5.2 Memoization

**File**: `components/MarkdownRenderer.tsx`

```typescript
// Already implemented with React.memo
// Add useMemo for expensive computations if needed

const processedContent = useMemo(() => {
  return formatAndCleanContent(content);
}, [content]);
```

### Phase 6: Testing Strategy

#### 6.1 Unit Tests

**File**: `__tests__/components/MarkdownRenderer.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import MarkdownRenderer from '../../components/MarkdownRenderer';

describe('MarkdownRenderer', () => {
  test('renders basic markdown', () => {
    render(<MarkdownRenderer content="# Hello World" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello World');
  });

  test('renders LaTeX math', () => {
    render(<MarkdownRenderer content="The equation is $x = y + z$" />);
    expect(screen.getByText(/equation/)).toBeInTheDocument();
  });

  test('renders code blocks with syntax highlighting', () => {
    const code = '```javascript\nconsole.log("hello");\n```';
    render(<MarkdownRenderer content={code} />);
    expect(screen.getByText('console.log("hello");')).toBeInTheDocument();
  });
});
```

#### 6.2 Integration Tests

Test the complete flow from user input to rendered output in the chat interface.

### Phase 7: Documentation and Guidelines

#### 7.1 User Guide

**File**: `docs/text-formatting-guide.md`

Create a comprehensive guide for users on how to use markdown and LaTeX in the chat interface.

#### 7.2 Developer Documentation

Update component documentation and add examples of advanced usage patterns.

## Implementation Timeline

### Week 1: Foundation
- Install dependencies
- Create MarkdownRenderer component
- Update ChatMessages component
- Basic markdown support

### Week 2: Enhanced Features
- LaTeX/math support
- Enhanced ChatInput with math insertion
- Code block improvements
- Interactive elements

### Week 3: Polish and Performance
- Performance optimizations
- Error handling
- Accessibility improvements
- Testing

### Week 4: Testing and Documentation
- Comprehensive testing
- User and developer documentation
- Bug fixes and refinements

## Best Practices

### 1. Security Considerations
- Sanitize user input to prevent XSS attacks
- Validate LaTeX expressions before rendering
- Use trusted libraries for markdown parsing

### 2. Performance Guidelines
- Use React.memo for expensive components
- Implement lazy loading for heavy features
- Consider virtualization for large chat histories

### 3. Accessibility
- Ensure proper ARIA labels for interactive elements
- Provide keyboard navigation for all features
- Include alt text for mathematical expressions

### 4. Error Handling
- Graceful fallbacks for malformed LaTeX
- Clear error messages for users
- Logging for debugging purposes

## Future Enhancements

### Advanced Features
- Real-time collaborative editing
- Custom LaTeX macro support
- Interactive mathematical graphs
- Export functionality (PDF, LaTeX)
- Plugin system for custom renderers

### Integration Opportunities
- Voice-to-LaTeX conversion
- Handwriting recognition for math
- Integration with external math tools
- Template library for common expressions

This implementation plan provides a comprehensive approach to enhancing text rendering in the STEM AI Assistant while maintaining performance, usability, and extensibility. 