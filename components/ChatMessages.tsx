import React, { Suspense, useEffect, useRef } from 'react';
import { Message as VercelMessage } from 'ai';
import dynamic from 'next/dynamic';
import PendingVisualizationCard from './visualizations/PendingVisualizationCard';
import Simple3DMolViewer from './visualizations/Simple3DMolViewer';
import Advanced3DMolViewer from './visualizations/Advanced3DMolViewer';
import MatterSimulator from './visualizations/MatterSimulator';
import OCRResult from './OCRResult';
// import PlotlyPlotter from './visualizations/PlotlyPlotter'; // Keep if other tools are added soon
import VisualizationErrorBoundary from './visualizations/VisualizationErrorBoundary';
import CodePreview from './CodePreview';
import { Typography } from './ui/Typography';
import { ToolLoadingState } from './ui/LoadingStates';
import { StreamingMarkdown } from './ui/StreamingMarkdown';
import { ToolResultRenderer, estimateThinkingTime } from './chat/ToolResultRenderer';
import { ThinkingTracesArtifact } from './chat/ThinkingTracesArtifact';

import MarkdownRenderer from './MarkdownRenderer';
import { TypingIndicator } from './ui/LoadingStates';

const PlotlyPlotter = dynamic(() => import('./visualizations/PlotlyPlotter'), {
  ssr: false,
  loading: () => <PendingVisualizationCard status="loading" message="Loading chart..." />,
});

// Use Vercel AI SDK's Message and ToolInvocation types
// Ensure your project's Message type aligns with what useChat provides, especially regarding toolInvocations.
type Message = VercelMessage;
// Explicitly type ToolInvocation if needed, or use VercelToolInvocation
// type ToolInvocation = VercelToolInvocation;

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

// Enhanced helper to clean up AI content, removing specific markers and improving formatting
function formatAndCleanContent(content: string | null | undefined): string {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  let cleanedContent = content;
  
  // Remove visualization markers
  cleanedContent = cleanedContent.replace(/\[NEEDS_VISUALIZATION:{.*?}\]/g, '');
  
  // Clean up extra whitespace but preserve intentional formatting
  cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Ensure proper math delimiter formatting
  cleanedContent = cleanedContent.replace(/\$\$(.*?)\$\$/g, '$$\n$1\n$$');
  
  return cleanedContent.trim();
}

// Visualization renderer component
const VisualizationRenderer: React.FC<{ toolName: string; result: unknown }> = ({ toolName, result }) => {
  const renderVisualization = () => {
    switch (toolName) {
      case 'displayMolecule3D':
        // Check if the result has advanced options
        const hasAdvancedOptions = result && typeof result === 'object' && result !== null && (
          (result as any).representationStyle !== 'stick' ||
          (result as any).colorScheme !== 'element' ||
          ((result as any).selections && (result as any).selections.length > 0) ||
          (result as any).showSurface ||
          (result as any).showLabels ||
          (result as any).backgroundColor !== 'white'
        );

        // Use Advanced3DMolViewer if any advanced options are present
        if (hasAdvancedOptions) {
          return <Advanced3DMolViewer {...(result as any)} />;
        } else {
          // Fall back to Simple3DMolViewer for basic usage
          return <Simple3DMolViewer {...(result as any)} />;
        }

      case 'displayPlotlyChart':
      case 'plotFunction2D':
      case 'plotFunction3D':
        return <PlotlyPlotter {...(result as any)} />;

      case 'displayPhysicsSimulation':
        return <MatterSimulator {...(result as any)} />;

      case 'performOCR':
        return <OCRResult {...(result as any)} />;

      default:
        // Fallback for unhandled tools - show raw result
        return (
          <div>
            <Typography variant="small" className="text-neutral-400 mb-2 font-medium">
              Tool: {toolName}
            </Typography>
            <CodePreview code={JSON.stringify(result, null, 2)} />
          </div>
        );
    }
  };

  return (
    <VisualizationErrorBoundary fallback={
      <div className="text-center py-4">
        <Typography variant="small" color="error">
          Error rendering tool output
        </Typography>
      </div>
    }>
      <Suspense fallback={
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-sm text-neutral-400">Loading visualization...</span>
        </div>
      }>
        {renderVisualization()}
      </Suspense>
    </VisualizationErrorBoundary>
  );
};

export default function ChatMessages({ messages, isLoading = false }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#2f2f2f] flex items-center justify-center">
            <svg className="w-6 h-6 text-[#8e8ea0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            How can I help you today?
          </h3>
          <p className="text-[#8e8ea0]">
            Ask about science, mathematics, or upload documents for analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#212121]">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {messages.map((message, index) => (
          <div key={message.id} className="animate-fade-in">
            {message.role === 'user' ? (
              // User message — right-aligned bubble
              <div className="flex justify-end mb-6">
                <div className="max-w-2xl">
                  <div className="bg-[#2f2f2f] rounded-2xl px-4 py-3 border border-[#4d4d4d]">
                    <p className="text-white leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            ) : (
              // AI message — ChatGPT style with avatar
              <div className="space-y-4">
                <div className="flex gap-4">
                  {/* AI Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#19c37d] flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  
                  <div className="flex-1 space-y-4 min-w-0">
                    {/* Thinking traces from reasoning parts */}
                    {message.parts?.map((part, partIndex) => {
                      if (part.type === 'reasoning') {
                        return (
                          <ThinkingTracesArtifact
                            key={`${message.id}-reasoning-${partIndex}`}
                            reasoning={part.details?.map(detail => 
                              detail.type === 'text' ? detail.text : (detail.type === 'redacted' ? '<redacted>' : '')
                            ).join('') || ''}
                            reasoningDetails={part.details}
                            metadata={{
                              tokenCount: part.details?.map(d => 
                                d.type === 'text' ? (d.text || '').split(' ').length : 0
                              ).reduce((a, b) => a + b, 0),
                            }}
                          />
                        );
                      }
                      return null;
                    })}

                    {/* Message content */}
                    {message.content && typeof message.content === 'string' && (
                      <div className="prose prose-invert max-w-none">
                        {message.role === 'assistant' && message.id === messages[messages.length - 1]?.id && index === messages.length - 1 ? (
                          // Latest message - use streaming if available
                          <StreamingMarkdown 
                            text={formatAndCleanContent(message.content)}
                            className="text-[#c5c5d2] leading-relaxed"
                            speed={10}
                            streamingMode="word"
                          />
                        ) : (
                          // Completed message
                          <MarkdownRenderer 
                            content={formatAndCleanContent(message.content)}
                            className="text-[#c5c5d2] leading-relaxed"
                            darkMode={true}
                          />
                        )}
                      </div>
                    )}

                    {/* Tool results using new renderer */}
                    {message.toolInvocations?.map((toolInvocation, toolIndex) => (
                      <ToolResultRenderer
                        key={`${message.id}-tool-${toolIndex}`}
                        toolInvocation={toolInvocation}
                        thinkingTime={estimateThinkingTime(toolInvocation.toolName, 'result' in toolInvocation ? toolInvocation.result : undefined)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator — shown while the API is responding */}
        {isLoading && (
          <div className="animate-fade-in">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#19c37d] flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div className="flex items-center pt-2">
                  <TypingIndicator />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
} 