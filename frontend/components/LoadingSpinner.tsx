'use client';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Calculating recommendation..." }: LoadingSpinnerProps) {
  return (
    <div className="text-center py-8">
      <div className="relative">
        {/* Improved loading spinner */}
        <div className="loading-spinner mx-auto mb-4"></div>
        
        {/* Inner airplane icon */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-2">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {message}
      </h3>
      
      <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
        <span>Analyzing solar position</span>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        This may take a few seconds...
      </div>
    </div>
  );
}
