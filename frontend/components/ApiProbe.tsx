'use client';

import React, { useEffect } from 'react';
import { probeApiInDev } from '@/lib/api';

/**
 * Development-only component that probes the API on app startup
 * Prints library versions and connectivity status to browser console
 */
export function ApiProbe() {
  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV === 'development') {
      // Probe API after a short delay to allow page to load
      const timer = setTimeout(() => {
        probeApiInDev();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // This component renders nothing - it's purely for side effects
  return null;
}
