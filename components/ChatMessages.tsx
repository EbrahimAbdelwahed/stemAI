import React from 'react';
import { Message as VercelMessage, ToolInvocation as VercelToolInvocation } from 'ai';
import dynamic from 'next/dynamic';
import PendingVisualizationCard from './visualizations/PendingVisualizationCard';
import Simple3DMolViewer from './visualizations/Simple3DMolViewer';
import Advanced3DMolViewer from './visualizations/Advanced3DMolViewer';
import MatterSimulator from './visualizations/MatterSimulator';
import OCRResult from './OCRResult';
// import PlotlyPlotter from './visualizations/PlotlyPlotter'; // Keep if other tools are added soon
import VisualizationErrorBoundary from './visualizations/VisualizationErrorBoundary';
import CodePreview from './CodePreview';
import { Card } from './ui/Card';
import { Typography } from './ui/Typography';

// Dynamic import for MarkdownRenderer to optimize performance
const MarkdownRenderer = dynamic(() => import('./MarkdownRenderer'), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-700 rounded mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
    </div>
  ),
  ssr: false
});

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

export default function ChatMessages({ messages }: ChatMessagesProps) {
  if (!messages || messages.length === 0) {
    return (
      <Card variant="glass" className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <Typography variant="large" className="text-gray-300 mb-2">
            No messages yet
          </Typography>
          <Typography variant="muted" className="text-gray-400">
            Start a conversation! Ask about STEM topics, request visualizations, or upload documents.
          </Typography>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`flex animate-fade-in ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          style={{ animationDelay: `${Math.min(index * 100, 500)}ms` }}
        >
          <div className={`max-w-3xl w-full ${message.role === 'user' ? 'ml-8' : 'mr-8'}`}>
            <Card
              variant={message.role === 'user' ? 'highlight' : 'enhanced'}
              className={`group relative overflow-hidden transition-all duration-300 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500/50 text-white'
                  : 'hover:shadow-xl hover:shadow-blue-500/10'
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-white/20' 
                      : 'bg-blue-500/20'
                  }`}>
                    {message.role === 'user' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                  </div>
                  <Typography 
                    variant="small" 
                    className={`font-semibold ${
                      message.role === 'user' ? 'text-white/80' : 'text-blue-400'
                    }`}
                  >
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </Typography>
                </div>
                <Typography 
                  variant="muted" 
                  className={`text-xs ${
                    message.role === 'user' ? 'text-white/60' : 'text-gray-500'
                  }`}
                >
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </div>
            
              {/* Render message content (text parts) */}
              {message.content && (
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer 
                    content={formatAndCleanContent(message.content)}
                    className="break-words"
                    darkMode={true} // You can make this dynamic based on theme context
                  />
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
                  <Card 
                    key={toolCallId} 
                    variant="glass" 
                    className="mt-4 border-gray-700/50 bg-gray-800/30"
                  >
                    <VisualizationErrorBoundary fallback={
                      <div className="text-center py-4">
                        <Typography variant="small" color="error">
                          Error rendering tool output
                        </Typography>
                      </div>
                    }>
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
                          {toolName === 'performOCR' && (
                            <OCRResult {...(result as any)} />
                          )}
                          {/* Fallback for unhandled tools or to show raw result */}
                          {!['displayMolecule3D', 'displayPlotlyChart', 'plotFunction2D', 'plotFunction3D', 'displayPhysicsSimulation', 'performOCR'].includes(toolName) && (
                            <div>
                              <Typography variant="small" className="text-gray-400 mb-2 font-medium">
                                Tool: {toolName}
                              </Typography>
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
                  </Card>
                );
              })}
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
} 