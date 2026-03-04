'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store/app-store';

export function ThemeManager({ children }: { children: React.ReactNode }) {
  const theme = useAppStore(state => state.theme);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return <>{children}</>;
} 