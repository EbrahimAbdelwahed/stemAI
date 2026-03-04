'use client';

import React, { useEffect, useRef } from 'react';
import { Message as VercelMessage } from 'ai';
import dynamic from 'next/dynamic';
import { Bot, User, Loader2 } from 'lucide-react';
import PendingVisualizationCard from './visualizations/PendingVisualizationCard';
import Simple3DMolViewer from './visualizations/Simple3DMolViewer';
import Advanced3DMolViewer from './visualizations/Advanced3DMolViewer';
import MatterSimulator from './visualizations/MatterSimulator';
import OCRResult from './OCRResult';
import VisualizationErrorBoundary from './visualizations/VisualizationErrorBoundary';
import CodePreview from './CodePreview';
import { cn } from '../lib/utils';

const MarkdownRenderer = dynamic(() => import('./MarkdownRenderer'), {
  loading: () => <div className="animate-pulse bg-muted h-20 rounded-lg" />,
  ssr: false,
});

const PlotlyPlotter = dynamic(() => import('./visualizations/PlotlyPlotter'), {
  ssr: false,
  loading: () => <PendingVisualizationCard status="loading" message="Loading chart..." />,
});

type Message = VercelMessage;

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

function formatAndCleanContent(content: string): string {
  let cleaned = content;
  cleaned = cleaned.replace(/\[NEEDS_VISUALIZATION:{.*?}\]/g, '');
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleaned = cleaned.replace(/\$\$(.*?)\$\$/g, '$$\n$1\n$$');
  return cleaned.trim();
}

function ToolInvocationRenderer({ toolInvocation }: { toolInvocation: any }) {
  const { toolCallId, toolName, state } = toolInvocation;
  const result = 'result' in toolInvocation ? toolInvocation.result : null;
  const error = 'error' in toolInvocation ? toolInvocation.error : null;

  return (
    <div key={toolCallId} className="mt-4 w-full">
      <VisualizationErrorBoundary fallback={<div className="text-destructive text-sm">Error rendering tool output.</div>}>
        {(state === 'call' || state === 'partial-call') && (
          <PendingVisualizationCard
            status="loading"
            message={`Running ${toolName}...`}
          />
        )}
        {state === 'result' && result && (
          <>
            {toolName === 'displayMolecule3D' && (() => {
              const hasAdvanced = result && (
                result.representationStyle !== 'stick' ||
                result.colorScheme !== 'element' ||
                (result.selections && result.selections.length > 0) ||
                result.showSurface ||
                result.showLabels ||
                result.backgroundColor !== 'white'
              );
              return hasAdvanced
                ? <Advanced3DMolViewer {...(result as any)} />
                : <Simple3DMolViewer {...(result as any)} />;
            })()}
            {toolName === 'displayPlotlyChart' && <PlotlyPlotter {...(result as any)} />}
            {(toolName === 'plotFunction2D' || toolName === 'plotFunction3D') && (
              <PlotlyPlotter {...(result as any)} />
            )}
            {toolName === 'displayPhysicsSimulation' && <MatterSimulator {...(result as any)} />}
            {toolName === 'performOCR' && <OCRResult {...(result as any)} />}
            {!['displayMolecule3D', 'displayPlotlyChart', 'plotFunction2D', 'plotFunction3D', 'displayPhysicsSimulation', 'performOCR'].includes(toolName) && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Tool: {toolName}</p>
                <CodePreview code={JSON.stringify(result, null, 2)} />
              </div>
            )}
          </>
        )}
        {error && (
          <PendingVisualizationCard
            status="error"
            message={`Error using ${toolName}`}
            errorMessage={typeof error === 'string' ? error : JSON.stringify(error)}
          />
        )}
      </VisualizationErrorBoundary>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('group flex gap-3 animate-in', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full border shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-foreground'
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      {/* Content */}
      <div className={cn('flex flex-col gap-1 max-w-[85%] md:max-w-[75%]', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-black rounded-br-md'
              : 'bg-muted rounded-bl-md'
          )}
        >
          {message.content && (
            <MarkdownRenderer
              content={formatAndCleanContent(message.content)}
              className="break-words"
              darkMode={!isUser}
            />
          )}
        </div>

        {/* Tool invocations */}
        {message.toolInvocations?.map((toolInvocation) => (
          <ToolInvocationRenderer
            key={toolInvocation.toolCallId}
            toolInvocation={toolInvocation}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm">
              <Bot className="size-4" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
