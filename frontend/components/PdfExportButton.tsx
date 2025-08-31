'use client';

import { useState } from 'react';
import { RecommendationResponse } from '@/lib/schemas';
import { postExportPdf } from '@/lib/api';
import { captureMap, isValidPngBase64, isWithinSizeLimit } from '@/lib/map-capture';

interface PdfExportButtonProps {
  recommendation: RecommendationResponse;
  mapRef: React.MutableRefObject<any>;
  disabled?: boolean;
}

export function PdfExportButton({ recommendation, mapRef, disabled = false }: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      // Capture current map state
      const map = mapRef.current?.getMap();
      if (!map) {
        throw new Error('Map not available');
      }

      const mapPngBase64 = await captureMap(map);

      // Validate map capture
      if (!isValidPngBase64(mapPngBase64)) {
        throw new Error('Invalid map capture format');
      }

      if (!isWithinSizeLimit(mapPngBase64)) {
        throw new Error('Map capture exceeds size limit (2MB)');
      }

      // Request PDF from backend
      const response = await postExportPdf({
        recommendation,
        map_png_base64: mapPngBase64
      });

      // Create blob and download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scenic-seat-recommendation.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('PDF export failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={disabled || isExporting}
        className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
          disabled || isExporting
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export PDF
          </>
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}



