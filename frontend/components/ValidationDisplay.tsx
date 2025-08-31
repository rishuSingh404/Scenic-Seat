'use client';

import { ValidationError } from '@/lib/validation';

interface ValidationDisplayProps {
  errors: ValidationError[];
  warnings: ValidationError[];
  className?: string;
}

export function ValidationDisplay({ errors, warnings, className = '' }: ValidationDisplayProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-5 h-5 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
              Please fix the following errors:
            </h4>
          </div>
          <ul className="space-y-2">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-red-400 dark:bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  <span className="font-medium capitalize">{error.field}:</span> {error.message}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-5 h-5 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Consider the following warnings:
            </h4>
          </div>
          <ul className="space-y-2">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 dark:bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  <span className="font-medium capitalize">{warning.field}:</span> {warning.message}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Field-specific error display
interface FieldErrorDisplayProps {
  errors: ValidationError[];
  warnings: ValidationError[];
  fieldName: string;
  className?: string;
}

export function FieldErrorDisplay({ errors, warnings, fieldName, className = '' }: FieldErrorDisplayProps) {
  const fieldErrors = errors.filter(error => error.field === fieldName);
  const fieldWarnings = warnings.filter(warning => warning.field === fieldName);

  if (fieldErrors.length === 0 && fieldWarnings.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Field Errors */}
      {fieldErrors.map((error, index) => (
        <div key={index} className="flex items-center space-x-2 text-sm">
          <svg className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-600 dark:text-red-400">{error.message}</span>
        </div>
      ))}

      {/* Field Warnings */}
      {fieldWarnings.map((warning, index) => (
        <div key={index} className="flex items-center space-x-2 text-sm">
          <svg className="w-4 h-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-yellow-600 dark:text-yellow-400">{warning.message}</span>
        </div>
      ))}
    </div>
  );
}



