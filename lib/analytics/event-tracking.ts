import { track } from '@vercel/analytics';

// Core STEM AI Events Type Definitions
export interface STEMAIEvents {
  // Chat & AI Interactions
  'chat_session_started': { page: string; timestamp: number }
  'chat_message_typed': { input_method: 'keyboard' | 'paste' | 'voice' }
  'chat_message_sent': { 
    model: string; 
    message_length: number; 
    has_attachments: boolean;
    context_included: boolean;
    timestamp: number;
  }
  'ai_processing_started': { model: string; timestamp: number }
  'ai_response_received': { 
    model: string; 
    response_time: number; 
    token_count: number;
    tool_calls: number;
    success: boolean;
    timestamp: number;
  }
  'tool_invoked': { 
    tool_type: '3dmol' | 'plotly' | 'physics' | 'ui_generation' | 'rag_search' | 'ocr';
    success: boolean; 
    execution_time: number;
    timestamp: number;
  }
  
  // Document Processing
  'document_uploaded': { 
    file_type: string; 
    size_bytes: number; 
    processing_time: number;
    upload_method: 'drag_drop' | 'file_picker';
    timestamp: number;
  }
  'document_processing_started': { file_type: string; size_bytes: number; timestamp: number }
  'ocr_processed': { 
    success: boolean; 
    text_length: number; 
    confidence_score: number;
    processing_time: number;
    timestamp: number;
  }
  'document_embedded': {
    chunk_count: number;
    embedding_time: number;
    vector_dimensions: number;
    timestamp: number;
  }
  'rag_search_performed': { 
    query_length: number; 
    results_count: number; 
    search_time: number;
    relevance_scores: number[];
    timestamp: number;
  }
  
  // UI Generation & Tools
  'ui_generation_started': { 
    component_type: string; 
    complexity_score: number;
    timestamp: number;
  }
  'ui_generation_completed': { 
    success: boolean; 
    generation_time: number; 
    components_count: number;
    lines_of_code: number;
    timestamp: number;
  }
  'visualization_rendered': { 
    viz_type: '3dmol' | 'plotly' | 'chart' | 'physics'; 
    data_points: number; 
    render_time: number;
    interactive: boolean;
    timestamp: number;
  }
  
  // 3D Molecule Specific
  '3dmol_visualization': {
    molecule_type: string;
    atom_count: number;
    render_time: number;
    interaction_type: 'rotate' | 'zoom' | 'style_change' | 'selection';
    timestamp: number;
  }
  
  // Plotly Specific
  'plotly_chart_created': {
    chart_type: string;
    data_points: number;
    render_time: number;
    interactive: boolean;
    timestamp: number;
  }
  
  // Physics Simulation Specific
  'physics_simulation': {
    simulation_type: string;
    complexity: 'low' | 'medium' | 'high';
    calculation_time: number;
    accuracy: number;
    timestamp: number;
  }
  
  // Performance & Errors
  'performance_issue': { 
    issue_type: string; 
    page: string; 
    severity: 'low' | 'medium' | 'high' | 'critical';
    metric_value: number;
    timestamp: number;
  }
  'error_encountered': { 
    error_type: string; 
    component: string; 
    user_impact: boolean;
    error_message: string;
    stack_trace?: string;
    timestamp: number;
  }
  
  // API Performance
  'api_call_completed': {
    endpoint: string;
    method: string;
    status: number;
    duration: number;
    response_size: number;
    success: boolean;
    timestamp: number;
  }
  'api_call_failed': {
    endpoint: string;
    method: string;
    error_type: string;
    error_message: string;
    duration: number;
    timestamp: number;
  }
  
  // Web Vitals
  'web_vital_cls': {
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    timestamp: number;
  }
  'web_vital_fid': {
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    timestamp: number;
  }
  'web_vital_fcp': {
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    timestamp: number;
  }
  'web_vital_lcp': {
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    timestamp: number;
  }
  'web_vital_ttfb': {
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    timestamp: number;
  }
}

// Type-safe event tracking function
export function trackEvent<K extends keyof STEMAIEvents>(
  eventName: K,
  eventData: STEMAIEvents[K]
): void {
  try {
    // Convert arrays to strings for Vercel Analytics compatibility
    const processedData = Object.fromEntries(
      Object.entries(eventData).map(([key, value]) => [
        key,
        Array.isArray(value) ? JSON.stringify(value) : value
      ])
    );
    
    track(eventName, processedData);
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
}

// Convenience tracking functions for common flows
export const ChatFlowTracker = {
  sessionStarted: (page: string) => trackEvent('chat_session_started', { 
    page, 
    timestamp: Date.now() 
  }),
  
  messageTyped: (inputMethod: 'keyboard' | 'paste' | 'voice' = 'keyboard') => 
    trackEvent('chat_message_typed', { input_method: inputMethod }),
  
  messageSent: (data: Omit<STEMAIEvents['chat_message_sent'], 'timestamp'>) => 
    trackEvent('chat_message_sent', { ...data, timestamp: Date.now() }),
  
  aiProcessingStarted: (model: string) => 
    trackEvent('ai_processing_started', { model, timestamp: Date.now() }),
  
  aiResponseReceived: (data: Omit<STEMAIEvents['ai_response_received'], 'timestamp'>) => 
    trackEvent('ai_response_received', { ...data, timestamp: Date.now() }),
  
  toolInvoked: (data: Omit<STEMAIEvents['tool_invoked'], 'timestamp'>) => 
    trackEvent('tool_invoked', { ...data, timestamp: Date.now() })
};

export const DocumentFlowTracker = {
  uploaded: (data: Omit<STEMAIEvents['document_uploaded'], 'timestamp'>) => 
    trackEvent('document_uploaded', { ...data, timestamp: Date.now() }),
  
  processingStarted: (fileType: string, sizeBytes: number) => 
    trackEvent('document_processing_started', { 
      file_type: fileType, 
      size_bytes: sizeBytes, 
      timestamp: Date.now() 
    }),
  
  ocrCompleted: (data: Omit<STEMAIEvents['ocr_processed'], 'timestamp'>) => 
    trackEvent('ocr_processed', { ...data, timestamp: Date.now() }),
  
  embedded: (data: Omit<STEMAIEvents['document_embedded'], 'timestamp'>) => 
    trackEvent('document_embedded', { ...data, timestamp: Date.now() }),
  
  ragSearchPerformed: (data: Omit<STEMAIEvents['rag_search_performed'], 'timestamp'>) => 
    trackEvent('rag_search_performed', { ...data, timestamp: Date.now() })
};

export const ToolUsageTracker = {
  '3dmol': (data: Omit<STEMAIEvents['3dmol_visualization'], 'timestamp'>) => 
    trackEvent('3dmol_visualization', { ...data, timestamp: Date.now() }),
  
  plotly: (data: Omit<STEMAIEvents['plotly_chart_created'], 'timestamp'>) => 
    trackEvent('plotly_chart_created', { ...data, timestamp: Date.now() }),
  
  physics: (data: Omit<STEMAIEvents['physics_simulation'], 'timestamp'>) => 
    trackEvent('physics_simulation', { ...data, timestamp: Date.now() }),
  
  uiGeneration: {
    started: (componentType: string, complexityScore: number) => 
      trackEvent('ui_generation_started', { 
        component_type: componentType, 
        complexity_score: complexityScore, 
        timestamp: Date.now() 
      }),
    
    completed: (data: Omit<STEMAIEvents['ui_generation_completed'], 'timestamp'>) => 
      trackEvent('ui_generation_completed', { ...data, timestamp: Date.now() })
  },
  
  visualization: (data: Omit<STEMAIEvents['visualization_rendered'], 'timestamp'>) => 
    trackEvent('visualization_rendered', { ...data, timestamp: Date.now() })
};

export const PerformanceTracker = {
  issue: (data: Omit<STEMAIEvents['performance_issue'], 'timestamp'>) => 
    trackEvent('performance_issue', { ...data, timestamp: Date.now() }),
  
  error: (data: Omit<STEMAIEvents['error_encountered'], 'timestamp'>) => 
    trackEvent('error_encountered', { ...data, timestamp: Date.now() }),
  
  apiCallCompleted: (data: Omit<STEMAIEvents['api_call_completed'], 'timestamp'>) => 
    trackEvent('api_call_completed', { ...data, timestamp: Date.now() }),
  
  apiCallFailed: (data: Omit<STEMAIEvents['api_call_failed'], 'timestamp'>) => 
    trackEvent('api_call_failed', { ...data, timestamp: Date.now() })
};

// Error tracking utility
export function trackError(error: Error, component: string, userImpact: boolean = true): void {
  PerformanceTracker.error({
    error_type: error.name,
    component,
    user_impact: userImpact,
    error_message: error.message,
    stack_trace: error.stack
  });
}

// API call wrapper for automatic tracking
export function withApiTracking<T>(
  endpoint: string,
  method: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  return apiCall()
    .then((response) => {
      const duration = performance.now() - startTime;
      PerformanceTracker.apiCallCompleted({
        endpoint,
        method,
        status: 200, // Assume success if no error thrown
        duration,
        response_size: JSON.stringify(response).length,
        success: true
      });
      return response;
    })
    .catch((error) => {
      const duration = performance.now() - startTime;
      PerformanceTracker.apiCallFailed({
        endpoint,
        method,
        error_type: error.name,
        error_message: error.message,
        duration
      });
      throw error;
    });
} 