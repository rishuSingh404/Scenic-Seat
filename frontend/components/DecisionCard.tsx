'use client';

import { RecommendationResponse } from '@/lib/schemas';
import { PdfExportButton } from './PdfExportButton';

interface DecisionCardProps {
  recommendation: RecommendationResponse;
  mapRef: React.MutableRefObject<any>;
}

export function DecisionCard({ recommendation, mapRef }: DecisionCardProps) {
  const getSideIcon = (side: string) => {
    switch (side) {
      case 'LEFT':
        return '👈';
      case 'RIGHT':
        return '👉';
      case 'EITHER':
        return '🤷';
      default:
        return '❓';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH':
        return 'text-green-600 bg-green-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStabilityColor = (stability: string) => {
    switch (stability) {
      case 'HIGH':
        return 'text-green-600 bg-green-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatAngle = (angle: number) => {
    return `${angle > 0 ? '+' : ''}${angle.toFixed(1)}°`;
  };

  const generateRationale = () => {
    const { side, bearing_deg, sun_azimuth_deg, relative_angle_deg } = recommendation;
    
    if (side === 'EITHER') {
      if (Math.abs(relative_angle_deg) < 15) {
        return `The sun is roughly ahead of your flight path (Δ = ${formatAngle(relative_angle_deg)}), so either window will have similar views.`;
      } else {
        return `The sun is roughly behind your flight path (Δ = ${formatAngle(relative_angle_deg)}), so either window will have similar views.`;
      }
    }

    const direction = side === 'LEFT' ? 'left' : 'right';
    const sunDirection = relative_angle_deg > 0 ? 'right' : 'left';
    
    return `Choose the ${direction} window. The sun (${sun_azimuth_deg.toFixed(1)}°) is to the ${sunDirection} of your flight path (${bearing_deg.toFixed(1)}°), giving you the best view with a relative angle of ${formatAngle(relative_angle_deg)}.`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="text-6xl mb-2">
          {getSideIcon(recommendation.side)}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {recommendation.side === 'EITHER' ? 'Either Window' : `${recommendation.side} Window`}
        </h2>
        <div className="flex items-center justify-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(recommendation.confidence)}`}>
            {recommendation.confidence} Confidence
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStabilityColor(recommendation.stability)}`}>
            {recommendation.stability} Stability
          </span>
          {recommendation.golden_hour && (
            <span className="px-3 py-1 rounded-full text-sm font-medium text-orange-600 bg-orange-100">
              ✨ Golden Hour
            </span>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="font-medium text-gray-900 mb-2">Recommendation</h3>
        <p className="text-gray-700 leading-relaxed">
          {generateRationale()}
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Technical Notes</h3>
        <p className="text-sm text-gray-600">
          {recommendation.notes}
        </p>
      </div>

      {/* PDF Export Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <PdfExportButton
          recommendation={recommendation}
          mapRef={mapRef}
        />
      </div>
    </div>
  );
}
