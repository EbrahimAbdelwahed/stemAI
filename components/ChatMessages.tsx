'use client';

import React from 'react';
import { Message as VercelMessage, ToolInvocation as VercelToolInvocation } from 'ai';
import { motion } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-8 text-center"
      >
        <div className="max-w-md mx-auto">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"
          >
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            Welcome to STEM AI Assistant
          </h3>
          <p className="text-gray-400">
            Start a conversation! Ask about science, math, engineering, or upload documents for analysis.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-3xl ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}>
            <div className={`group relative ${message.role === 'user' ? '' : ''}`}>
              {/* Avatar and Name */}
              <div className={`flex items-center space-x-3 mb-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role !== 'user' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
                  </motion.div>
                )}
                <span className={`text-sm font-medium ${
                  message.role === 'user' ? 'text-blue-400' : 'text-gray-300'
                }`}>
                  {message.role === 'user' ? 'You' : 'STEM AI'}
                </span>
                {message.role === 'user' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </motion.div>
                )}
              </div>

              {/* Message Bubble */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={`relative rounded-2xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'glass border border-gray-800/50 text-gray-100'
                }`}
              >
                {/* Decorative corner for AI messages */}
                {message.role !== 'user' && (
                  <div className="absolute -left-2 top-4 w-3 h-3 bg-gray-900/50 transform rotate-45 border-l border-t border-gray-800/50" />
                )}

                {/* Message content */}
                {message.content && (
                  <div className={`prose prose-sm max-w-none ${
                    message.role === 'user' ? 'prose-invert' : 'prose-gray dark:prose-invert'
                  } prose-headings:text-gray-100 prose-p:text-gray-200 prose-strong:text-gray-100 prose-em:text-gray-200 prose-code:text-gray-100`}>
                    <MarkdownRenderer 
                      content={formatAndCleanContent(message.content)}
                      className="break-words text-gray-100"
                      darkMode={true}
                    />
                  </div>
                )}

                {/* Tool Invocations */}
                {message.toolInvocations?.map((toolInvocation) => {
                  const { toolCallId, toolName, state } = toolInvocation;
                  const result = 'result' in toolInvocation ? toolInvocation.result : null;
                  const error = 'error' in toolInvocation ? toolInvocation.error : null;

                  return (
                    <motion.div 
                      key={toolCallId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <div className="glass rounded-xl p-4 border border-gray-700/50">
                        <VisualizationErrorBoundary fallback={
                          <div className="text-center py-4">
                            <p className="text-sm text-red-400">
                              Error rendering tool output
                            </p>
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
                                  const hasAdvancedOptions = result && (
                                    result.representationStyle !== 'stick' ||
                                    result.colorScheme !== 'element' ||
                                    (result.selections && result.selections.length > 0) ||
                                    result.showSurface ||
                                    result.showLabels ||
                                    result.backgroundColor !== 'white'
                                  );

                                  if (hasAdvancedOptions) {
                                    return <Advanced3DMolViewer {...(result as any)} />;
                                  } else {
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
                              {!['displayMolecule3D', 'displayPlotlyChart', 'plotFunction2D', 'plotFunction3D', 'displayPhysicsSimulation', 'performOCR'].includes(toolName) && (
                                <div>
                                  <p className="text-sm text-gray-400 mb-2 font-medium">
                                    Tool: {toolName}
                                  </p>
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
                    </motion.div>
                  );
                })}

                {/* Timestamp */}
                <div className={`mt-2 text-xs ${
                  message.role === 'user' ? 'text-blue-200/60' : 'text-gray-500'
                }`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 