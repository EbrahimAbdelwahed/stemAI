import React from 'react';
import { Message as VercelMessage, ToolInvocation as VercelToolInvocation } from 'ai';
import dynamic from 'next/dynamic';
import PendingVisualizationCard from './visualizations/PendingVisualizationCard';
import Simple3DMolViewer from './visualizations/Simple3DMolViewer';
import Advanced3DMolViewer from './visualizations/Advanced3DMolViewer';
import MatterSimulator from './visualizations/MatterSimulator';
// import PlotlyPlotter from './visualizations/PlotlyPlotter'; // Keep if other tools are added soon
import VisualizationErrorBoundary from './visualizations/VisualizationErrorBoundary';
import CodePreview from './CodePreview';

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

// Helper to clean up AI content, removing specific markers if any remain by mistake
function formatAndCleanContent(content: string): string {
  let cleanedContent = content;
  // Removed 's' flag from regex for broader ES compatibility
  cleanedContent = cleanedContent.replace(/\[NEEDS_VISUALIZATION:{.*?}\]/g, '');
  // Add other cleaning rules if necessary
  return cleanedContent;
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  if (!messages || messages.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        <p className="text-lg">No messages yet. Start a conversation!</p>
        <p className="text-sm">Ask about STEM topics, request visualizations, or upload documents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-2xl w-full p-3 md:p-4 rounded-xl shadow-md flex flex-col ${ 
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 dark:text-gray-100'
            }`}
          >
            <div className="text-xs font-semibold mb-1 opacity-80">
              {message.role === 'user' ? 'You' : 'AI Assistant'}
            </div>
            
            {/* Render message content (text parts) */}
            {message.content && (
              <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                {formatAndCleanContent(message.content)}
              </div>
            )}



            {/* Render Tool Invocations if any */}
            {message.toolInvocations?.map((toolInvocation) => {
              const { toolCallId, toolName, state } = toolInvocation;
              
              // Access result differently based on state
              const result = 'result' in toolInvocation ? toolInvocation.result : null;
              const error = 'error' in toolInvocation ? toolInvocation.error : null;

              console.log('[ChatMessages] Rendering tool invocation:', { toolName, state, result });

              return (
                <div key={toolCallId} className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 w-full">
                  <VisualizationErrorBoundary fallback={<div>Error rendering tool output.</div>}>
                    {state === 'call' && (
                      <PendingVisualizationCard 
                        status="loading" 
                        message={`AI is calling tool: ${toolName}...`}
                      />
                    )}
                    {state === 'result' && result && (
                      <>
                        {toolName === 'displayMolecule3D' && (
                          (() => {
                            // Check if the result has advanced options
                            const hasAdvancedOptions = result && (
                              result.representationStyle !== 'stick' ||
                              result.colorScheme !== 'element' ||
                              (result.selections && result.selections.length > 0) ||
                              result.showSurface ||
                              result.showLabels ||
                              result.backgroundColor !== 'white'
                            );

                            console.log('[ChatMessages] displayMolecule3D advanced check:', { hasAdvancedOptions, result });

                            // Use Advanced3DMolViewer if any advanced options are present
                            if (hasAdvancedOptions) {
                              return <Advanced3DMolViewer {...(result as any)} />;
                            } else {
                              // Fall back to Simple3DMolViewer for basic usage
                              return <Simple3DMolViewer {...(result as any)} />;
                            }
                          })()
                        )}
                        {toolName === 'displayPlotlyChart' && (
                          <PlotlyPlotter {...(result as any)} /> 
                        )}
                        {(toolName === 'plotFunction2D' || toolName === 'plotFunction3D') && (
                          <PlotlyPlotter {...(result as any)} />
                        )}
                        {toolName === 'displayPhysicsSimulation' && (
                          <MatterSimulator {...(result as any)} />
                        )}
                        {/* Fallback for unhandled tools or to show raw result */}
                        {!['displayMolecule3D', 'displayPlotlyChart', 'plotFunction2D', 'plotFunction3D', 'displayPhysicsSimulation'].includes(toolName) && (
                           <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Tool: {toolName}</p>
                            <CodePreview code={JSON.stringify(result, null, 2)} />
                          </div>
                        )}
                      </>
                    )}
                    {state === 'partial-call' && (
                      <PendingVisualizationCard 
                        status="loading" 
                        message={`Preparing tool: ${toolName}...`}
                      />
                    )}
                    {error && (
                       <PendingVisualizationCard 
                        status="error" 
                        message={`Error using tool: ${toolName}`}
                        errorMessage={typeof error === 'string' ? error : JSON.stringify(error)}
                      />
                    )}
                  </VisualizationErrorBoundary>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
} 