'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';

export default function GeneratePage() {
  const [code, setCode] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { model: 'deepseek-chat', mode: 'generate' },
    onFinish: (message) => {
      // Extract code from the generateReactComponent tool result
      const toolCall = message.toolInvocations?.find(
        (t) => t.toolName === 'generateReactComponent' && 'result' in t
      );
      if (toolCall && 'result' in toolCall) {
        const result = toolCall.result as { code?: string };
        if (result?.code) setCode(result.code);
      } else {
        // Fallback: extract fenced code block from message content
        const match = message.content.match(/```(?:tsx?|jsx?)\n([\s\S]*?)```/);
        if (match) setCode(match[1]);
      }
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <AppLayout showSidebar={false}>
      <div className="flex h-screen flex-col md:flex-row bg-neutral-950">
        {/* Chat panel */}
        <div className="flex flex-col w-full md:w-1/2 border-r border-neutral-800">
          <div className="px-4 py-3 border-b border-neutral-800 flex items-center gap-2">
            <Typography variant="h3" className="text-white text-base font-semibold">
              React Component Generator
            </Typography>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2">
                <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm">Describe a React component to generate</p>
                <p className="text-xs text-neutral-600">e.g. &quot;A dark-mode toggle button with animation&quot;</p>
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-800 text-neutral-100'
                  }`}
                >
                  {m.content || (m.role === 'assistant' && isLoading ? '...' : '')}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-neutral-800 text-neutral-400 rounded-lg px-3 py-2 text-sm">
                  Generating...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-800 flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Describe a component..."
              disabled={isLoading}
              className="flex-1 bg-neutral-800 text-white rounded-lg px-3 py-2 text-sm outline-none placeholder-neutral-500 disabled:opacity-50"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="sm">
              {isLoading ? 'Wait...' : 'Generate'}
            </Button>
          </form>
        </div>

        {/* Code preview panel */}
        <div className="flex flex-col w-full md:w-1/2">
          <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
            <Typography variant="h3" className="text-white text-base font-semibold">
              Generated Code
            </Typography>
            {code && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(code)}
              >
                Copy
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {code ? (
              <pre className="text-sm font-mono text-neutral-200 bg-neutral-900 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
                <code>{code}</code>
              </pre>
            ) : (
              <Card className="h-full flex items-center justify-center border-neutral-800 bg-neutral-900">
                <div className="text-center text-neutral-500 space-y-2">
                  <svg className="w-12 h-12 mx-auto opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <p className="text-sm">Generated component code will appear here</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
