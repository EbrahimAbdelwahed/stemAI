import { PerformanceTracker, ChatFlowTracker, DocumentFlowTracker } from './event-tracking';
// import { performanceMonitor } from '../performance/monitor'; // Commented out - file doesn't exist

/**
 * Migration Bridge for Performance Monitoring
 * 
 * This utility bridges the old custom performance monitoring system
 * with the new Vercel Analytics system, allowing for gradual migration
 * while maintaining backward compatibility.
 */

// Bridge function to migrate API call monitoring
export function migrateApiCallMonitoring<T>(
  endpoint: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = performance.now();
  
  return operation()
    .then((result) => {
      const duration = performance.now() - startTime;
      
      // Send to new Vercel Analytics system
      PerformanceTracker.apiCallCompleted({
        endpoint,
        method: metadata?.method || 'GET',
        status: 200,
        duration,
        response_size: JSON.stringify(result).length,
        success: true
      });
      
      // Keep old system for backward compatibility (optional)
      // if (typeof performanceMonitor !== 'undefined') {
      //   performanceMonitor.measureAPICall(endpoint, () => Promise.resolve(result), metadata);
      // }
      
      return result;
    })
    .catch((error) => {
      const duration = performance.now() - startTime;
      
      // Send to new Vercel Analytics system
      PerformanceTracker.apiCallFailed({
        endpoint,
        method: metadata?.method || 'GET',
        error_type: error.name,
        error_message: error.message,
        duration
      });
      
      throw error;
    });
}

// Bridge function to migrate web vitals recording
export function migrateWebVitalsRecording(page: string, vitals: {
  ttfb?: number;
  fcp?: number;
  lcp?: number;
  tti?: number;
  cls?: number;
  fid?: number;
}) {
  // Convert to new format and send to Vercel Analytics
  if (vitals.cls !== undefined) {
    PerformanceTracker.issue({
      issue_type: 'web_vital_cls',
      page,
      severity: vitals.cls > 0.25 ? 'high' : vitals.cls > 0.1 ? 'medium' : 'low',
      metric_value: vitals.cls
    });
  }
  
  if (vitals.fcp !== undefined) {
    PerformanceTracker.issue({
      issue_type: 'web_vital_fcp',
      page,
      severity: vitals.fcp > 3000 ? 'high' : vitals.fcp > 1800 ? 'medium' : 'low',
      metric_value: vitals.fcp
    });
  }
  
  if (vitals.lcp !== undefined) {
    PerformanceTracker.issue({
      issue_type: 'web_vital_lcp',
      page,
      severity: vitals.lcp > 4000 ? 'high' : vitals.lcp > 2500 ? 'medium' : 'low',
      metric_value: vitals.lcp
    });
  }
  
  // Keep old system for backward compatibility
  // if (typeof performanceMonitor !== 'undefined') {
  //   performanceMonitor.recordWebVitals(page, vitals);
  // }
}

// Bridge function to migrate chat performance tracking
export function migrateChatPerformanceTracking(
  model: string,
  messageLength: number,
  responseTime: number,
  success: boolean = true
) {
  if (success) {
    ChatFlowTracker.aiResponseReceived({
      model,
      response_time: responseTime,
      token_count: messageLength,
      tool_calls: 0,
      success: true
    });
  } else {
    PerformanceTracker.error({
      error_type: 'chat_response_failed',
      component: 'ChatAPI',
      user_impact: true,
      error_message: 'Chat response failed'
    });
  }
}

// Bridge function to migrate document processing tracking
export function migrateDocumentProcessingTracking(
  fileName: string,
  fileSize: number,
  processingTime: number,
  success: boolean = true,
  uploadMethod: 'drag_drop' | 'file_picker' = 'file_picker'
) {
  if (success) {
    DocumentFlowTracker.uploaded({
      file_type: fileName.split('.').pop() || 'unknown',
      size_bytes: fileSize,
      processing_time: processingTime,
      upload_method: uploadMethod
    });
  } else {
    PerformanceTracker.error({
      error_type: 'document_processing_failed',
      component: 'DocumentProcessor',
      user_impact: true,
      error_message: 'Document processing failed'
    });
  }
}

// Utility to gradually phase out old monitoring
export function isOldMonitoringEnabled(): boolean {
  return process.env.ENABLE_OLD_MONITORING === 'true';
}

// Migration status checker
export function getMigrationStatus() {
  return {
    vercelAnalyticsEnabled: true,
    oldMonitoringEnabled: isOldMonitoringEnabled(),
    migrationComplete: !isOldMonitoringEnabled(),
    recommendedAction: isOldMonitoringEnabled() 
      ? 'Consider disabling old monitoring by setting ENABLE_OLD_MONITORING=false'
      : 'Migration complete - old monitoring disabled'
  };
}

// Performance comparison utility
export async function comparePerformanceMetrics(
  operation: string,
  testFunction: () => Promise<any>
) {
  const results = {
    vercelAnalytics: { duration: 0, success: false },
    oldSystem: { duration: 0, success: false }
  };
  
  // Test with Vercel Analytics
  try {
    const startTime = performance.now();
    await testFunction();
    results.vercelAnalytics.duration = performance.now() - startTime;
    results.vercelAnalytics.success = true;
  } catch (error) {
    console.error('Vercel Analytics test failed:', error);
  }
  
  // Test with old system (if enabled)
  if (isOldMonitoringEnabled()) {
    try {
      const startTime = performance.now();
      await testFunction();
      results.oldSystem.duration = performance.now() - startTime;
      results.oldSystem.success = true;
    } catch (error) {
      console.error('Old system test failed:', error);
    }
  }
  
  return {
    operation,
    results,
    recommendation: results.vercelAnalytics.success 
      ? 'Vercel Analytics is working correctly'
      : 'Check Vercel Analytics configuration'
  };
} 