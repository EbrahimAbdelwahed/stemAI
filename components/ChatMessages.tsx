import React, { Suspense } from 'react';
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

// Temporary direct import to fix chunk loading issue
// TODO: Restore dynamic import after resolving chunk loading
import MarkdownRenderer from './MarkdownRenderer';

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
  // pendingVisualizations prop is removed
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

export default function ChatMessages({ messages }: ChatMessagesProps) {
  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <Typography variant="large" className="text-neutral-300 mb-2">
            No messages yet
          </Typography>
          <Typography variant="muted" className="text-neutral-400">
            Start a conversation! Ask about STEM topics, request visualizations, or upload documents.
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className="animate-fade-in"
          style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
        >
          {message.role === 'user' ? (
            // User messages: Minimal bubble on the right
            <div className="flex justify-end">
              <div className="max-w-2xl">
                <div className="bg-neutral-700 text-white px-4 py-3 rounded border border-neutral-600">
                  <div className="text-sm leading-relaxed font-mono">{message.content}</div>
                </div>
              </div>
            </div>
          ) : (
            // AI messages: Terminal-like display on background
            <div className="space-y-4">
              {/* AI Terminal Header */}
              <div className="flex items-center space-x-2 text-neutral-400 text-sm">
                <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
                <span>AI Assistant</span>
                <div className="flex-1 h-px bg-neutral-800"></div>
                <span className="text-xs">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              {/* AI Message Content */}
              {message.content && typeof message.content === 'string' && (
                <div className="pl-4 border-l-2 border-neutral-800">
                  <div className="prose prose-neutral max-w-none">
                    {message.role === 'assistant' && message.id === messages[messages.length - 1]?.id && index === messages.length - 1 ? (
                      // This is the latest AI message - streaming with markdown
                      <StreamingMarkdown 
                        text={formatAndCleanContent(message.content)}
                        className="text-neutral-200 leading-relaxed"
                        speed={4.5} // 4.5 words per second for natural reading flow
                        streamingMode="word" // Word-based streaming for better UX
                      />
                    ) : (
                      // Completed message - render with enhanced Markdown
                      <MarkdownRenderer 
                        content={formatAndCleanContent(message.content)}
                        className="break-words text-neutral-200 leading-relaxed"
                        darkMode={true}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Tool Invocations - displayed as terminal output */}
              {message.toolInvocations?.map((toolInvocation, toolIndex) => {
                const { toolCallId, toolName, state } = toolInvocation;
                
                // Access result differently based on state
                const result = 'result' in toolInvocation ? toolInvocation.result : null;
                const error = 'error' in toolInvocation ? toolInvocation.error : null;

                console.log('[ChatMessages] Rendering tool invocation:', { toolName, state, result });

                // Enhanced loading state rendering with progressive status
                if (state === 'call' || state === 'partial-call') {
                  // Determine loading status based on tool type and timing
                  let loadingStatus: 'initializing' | 'processing' | 'rendering' | 'finalizing' = 'initializing';
                  let customMessage: string | undefined;

                  // Simulate progressive loading status based on state and tool type
                  if (state === 'partial-call') {
                    loadingStatus = 'initializing';
                    customMessage = `Setting up ${toolName}...`;
                  } else if (state === 'call') {
                    // For visualization tools, show more specific status
                    if (toolName.includes('3D') || toolName.includes('Molecule')) {
                      loadingStatus = 'rendering';
                      customMessage = 'Building 3D structure...';
                    } else if (toolName.includes('plot') || toolName.includes('Chart')) {
                      loadingStatus = 'processing';
                      customMessage = 'Calculating data points...';
                    } else if (toolName.includes('Physics') || toolName.includes('Simulation')) {
                      loadingStatus = 'processing';
                      customMessage = 'Initializing physics simulation...';
                    } else if (toolName.includes('OCR')) {
                      loadingStatus = 'processing';
                      customMessage = 'Analyzing image content...';
                    } else {
                      loadingStatus = 'processing';
                    }
                  }

                  return (
                    <div key={toolCallId} className="pl-4 border-l-2 border-neutral-800 mt-4">
                      <div className="text-neutral-400 text-sm mb-2">
                        <span className="text-neutral-500">→</span> Running {toolName}
                      </div>
                      <ToolLoadingState 
                        toolName={toolName}
                        status={loadingStatus}
                        message={customMessage}
                        className="animate-fade-in"
                      />
                    </div>
                  );
                }

                // Map tool invocation to ToolResultCard format
                const toolResult = {
                  id: toolCallId,
                  toolName,
                  status: state === 'result' ? 'success' as const : 
                          error ? 'error' as const : 'success' as const,
                  result: result || undefined,
                  error: error ? (typeof error === 'string' ? error : JSON.stringify(error)) : undefined,
                  metadata: {
                    executionTime: Math.floor(Math.random() * 2000) + 500, // Placeholder - could be tracked
                    dataSize: result ? JSON.stringify(result).length / 1024 / 1024 : 0, // Convert to MB
                    complexity: 'medium' as const, // Could be determined based on result size/type
                    description: state === 'result' ? `${toolName} completed successfully` : undefined
                  }
                };

                return (
                  <div 
                    key={toolCallId} 
                    className="pl-4 border-l-2 border-neutral-800 mt-4"
                  >
                    <div className="text-neutral-400 text-sm mb-2">
                      <span className="text-neutral-500">→</span> {toolName} {state === 'result' ? 'completed' : 'executing'}
                    </div>
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded overflow-hidden">
                      {/* Render visualization content */}
                      {state === 'result' && result && (
                        <div className="p-4">
                          <VisualizationRenderer toolName={toolName} result={result} />
                        </div>
                      )}
                      {error && (
                        <div className="p-4 text-red-400 text-sm">
                          Error: {typeof error === 'string' ? error : JSON.stringify(error)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 