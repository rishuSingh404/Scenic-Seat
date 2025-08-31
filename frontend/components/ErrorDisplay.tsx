'use client';

interface ErrorDisplayProps {
  message: string;
  type: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, type, onRetry }: ErrorDisplayProps) {
  const getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case 'GEO_ERROR':
        return '🗺️';
      case 'POLAR_DAY':
      case 'UNDEFINED_SUN':
        return '🌌';
      case 'VALIDATION':
      case 'VALIDATION_ERROR':
        return '⚠️';
      case 'NETWORK_ERROR':
        return '📡';
      default:
        return '❌';
    }
  };

  const getErrorTitle = (errorType: string) => {
    switch (errorType) {
      case 'GEO_ERROR':
        return 'Location Not Found';
      case 'POLAR_DAY':
        return 'Polar Day/Night';
      case 'UNDEFINED_SUN':
        return 'Sun Position Undefined';
      case 'VALIDATION':
      case 'VALIDATION_ERROR':
        return 'Invalid Input';
      case 'NETWORK_ERROR':
        return 'Connection Error';
      default:
        return 'Error';
    }
  };

  const getErrorColor = (errorType: string) => {
    switch (errorType) {
      case 'NETWORK_ERROR':
        return 'border-blue-200 bg-blue-50';
      case 'GEO_ERROR':
      case 'VALIDATION':
      case 'VALIDATION_ERROR':
        return 'border-yellow-200 bg-yellow-50';
      case 'POLAR_DAY':
      case 'UNDEFINED_SUN':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-red-200 bg-red-50';
    }
  };

  const getHelpText = (errorType: string) => {
    switch (errorType) {
      case 'GEO_ERROR':
        return 'Please select a city from the dropdown list. We only support cities in our database.';
      case 'POLAR_DAY':
        return 'During polar day or night periods, the sun may not rise or set normally. Try a different date or location.';
      case 'UNDEFINED_SUN':
        return 'Solar calculations are not available for this location and time. Try a different date or location.';
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'NETWORK_ERROR':
        return 'Please check your internet connection and make sure the backend server is running.';
      default:
        return 'Please try again or contact support if the problem persists.';
    }
  };

  return (
    <div className={`border rounded-xl p-6 ${getErrorColor(type)}`}>
      <div className="text-center">
        <div className="text-4xl mb-3">
          {getErrorIcon(type)}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {getErrorTitle(type)}
        </h3>
        <p className="text-gray-700 mb-4">
          {message}
        </p>
        <p className="text-sm text-gray-600 mb-6">
          {getHelpText(type)}
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}



