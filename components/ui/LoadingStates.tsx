import React from 'react';

interface LoadingDotsProps {
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ className = "" }) => (
  <div className={`flex space-x-1 ${className}`}>
    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
  </div>
);

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
}

export const ShimmerText: React.FC<ShimmerTextProps> = ({ children, className = "" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-shimmer"></div>
    <div className="relative bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent animate-pulse">
      {children}
    </div>
  </div>
);

interface ToolLoadingStateProps {
  toolName: string;
  status?: 'initializing' | 'processing' | 'rendering' | 'finalizing';
  message?: string;
  className?: string;
}

export const ToolLoadingState: React.FC<ToolLoadingStateProps> = ({ 
  toolName, 
  status = 'processing',
  message,
  className = ""
}) => {
  const getToolIcon = () => {
    switch (toolName) {
      case 'displayMolecule3D':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'plotFunction2D':
      case 'plotFunction3D':
      case 'displayPlotlyChart':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'displayPhysicsSimulation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'performOCR':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
    }
  };

  const getStatusMessage = () => {
    if (message) return message;
    
    const statusMessages = {
      initializing: 'Initializing...',
      processing: 'Processing...',
      rendering: 'Rendering...',
      finalizing: 'Finalizing...'
    };

    const toolMessages = {
      displayMolecule3D: {
        initializing: 'Loading molecular data...',
        processing: 'Building 3D structure...',
        rendering: 'Rendering molecule...',
        finalizing: 'Applying styles...'
      },
      plotFunction2D: {
        initializing: 'Parsing function...',
        processing: 'Calculating points...',
        rendering: 'Creating plot...',
        finalizing: 'Applying layout...'
      },
      plotFunction3D: {
        initializing: 'Parsing 3D function...',
        processing: 'Computing surface...',
        rendering: 'Rendering 3D plot...',
        finalizing: 'Optimizing display...'
      },
      displayPlotlyChart: {
        initializing: 'Preparing chart data...',
        processing: 'Processing data points...',
        rendering: 'Creating visualization...',
        finalizing: 'Applying styling...'
      },
      displayPhysicsSimulation: {
        initializing: 'Setting up physics world...',
        processing: 'Creating simulation objects...',
        rendering: 'Starting simulation...',
        finalizing: 'Initializing controls...'
      },
      performOCR: {
        initializing: 'Analyzing image...',
        processing: 'Extracting text...',
        rendering: 'Processing results...',
        finalizing: 'Formatting output...'
      }
    };

    return toolMessages[toolName as keyof typeof toolMessages]?.[status] || statusMessages[status];
  };

  return (
    <div className={`flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 ${className}`}>
      <div className="flex-shrink-0">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
          <div className="relative w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
            {getToolIcon()}
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <ShimmerText className="text-sm font-medium text-blue-300">
            {getStatusMessage()}
          </ShimmerText>
          <LoadingDots className="flex-shrink-0" />
        </div>
        
        <div className="mt-1">
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-1.5 rounded-full animate-pulse" style={{
              width: status === 'initializing' ? '25%' : 
                     status === 'processing' ? '50%' : 
                     status === 'rendering' ? '75%' : '90%'
            }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className = "" }) => (
  <div className={`flex items-center space-x-2 text-slate-400 ${className}`}>
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
    </div>
    <span className="text-sm">AI is thinking...</span>
  </div>
);

interface StreamingTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export const StreamingText: React.FC<StreamingTextProps> = ({ 
  text, 
  className = "",
  speed = 50 
}) => {
  const [displayedText, setDisplayedText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  React.useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse border-r-2 border-blue-400 ml-0.5"></span>
      )}
    </span>
  );
}; 