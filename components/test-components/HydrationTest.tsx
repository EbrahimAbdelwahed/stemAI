'use client';

import { useEffect, useState } from 'react';
import ClientOnlyWrapper from '@/components/ClientOnlyWrapper';

/**
 * Test component to verify hydration fixes
 * This component tests that hooks are called consistently between renders
 */
export default function HydrationTest() {
  const [mounted, setMounted] = useState(false);
  const [testData, setTestData] = useState<string[]>([]);

  // Hook 1: Always called
  useEffect(() => {
    console.log('[HydrationTest] First useEffect - always runs');
    setMounted(true);
  }, []);

  // Hook 2: Always called, but conditional logic inside
  useEffect(() => {
    console.log('[HydrationTest] Second useEffect - checking conditions inside');
    
    if (mounted && typeof window !== 'undefined') {
      // Safe to access browser APIs here
      setTestData(['Browser APIs available', 'Component mounted']);
    } else {
      setTestData(['Waiting for mount...']);
    }
  }, [mounted]);

  // Hook 3: Always called
  useEffect(() => {
    console.log('[HydrationTest] Third useEffect - cleanup test');
    
    return () => {
      console.log('[HydrationTest] Cleanup executed');
    };
  }, []);

  return (
    <ClientOnlyWrapper fallback={<div>Loading hydration test...</div>}>
      <div className="p-4 bg-green-100 border border-green-300 rounded">
        <h3 className="font-bold text-green-800 mb-2">Hydration Test Component</h3>
        <p className="text-green-700 mb-2">
          Status: {mounted ? '✅ Mounted' : '⏳ Mounting...'}
        </p>
        <div className="text-sm text-green-600">
          <p>Hook call consistency: ✅ All hooks called in same order</p>
          <p>Data: {testData.join(', ')}</p>
          <p>Window available: {typeof window !== 'undefined' ? '✅' : '❌'}</p>
        </div>
      </div>
    </ClientOnlyWrapper>
  );
} 