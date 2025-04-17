'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { getClientStore } from './store';

/**
 * Redux provider wrapper for the application
 * Uses client-side store with support for hydration in Next.js app router
 */
export function Providers({ children }: { children: ReactNode }) {
  // Get the store once per client
  const store = getClientStore();
  
  return <Provider store={store}>{children}</Provider>;
} 