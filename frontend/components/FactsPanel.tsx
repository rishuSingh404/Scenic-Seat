'use client';

import { RecommendationResponse } from '@/lib/schemas';

interface FactsPanelProps {
  recommendation: RecommendationResponse;
}

export function FactsPanel({ recommendation }: FactsPanelProps) {
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return timeString;
    }
  };

  const formatAngle = (angle: number) => {
    return `${angle.toFixed(1)}°`;
  };

  const getCompassDirection = (bearing: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(bearing / 22.5) % 16;
    return directions[index];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Technical Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flight Data */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="mr-2">🧭</span>
            Flight Data
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Bearing</span>
              <span className="font-medium text-gray-900">
                {formatAngle(recommendation.bearing_deg)} ({getCompassDirection(recommendation.bearing_deg)})
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Sun Azimuth</span>
              <span className="font-medium text-gray-900">
                {formatAngle(recommendation.sun_azimuth_deg)} ({getCompassDirection(recommendation.sun_azimuth_deg)})
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Relative Angle (Δ)</span>
              <span className="font-medium text-gray-900">
                {recommendation.relative_angle_deg > 0 ? '+' : ''}{formatAngle(recommendation.relative_angle_deg)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Golden Hour</span>
              <span className="font-medium text-gray-900">
                {recommendation.golden_hour ? '✨ Yes' : '❌ No'}
              </span>
            </div>
          </div>
        </div>

        {/* Solar Times */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="mr-2">☀️</span>
            Solar Times
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Civil Dawn</span>
              <span className="font-medium text-gray-900">
                {formatTime(recommendation.phase_times.civil_dawn)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Sunrise</span>
              <span className="font-medium text-gray-900">
                {formatTime(recommendation.phase_times.sunrise)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Sunset</span>
              <span className="font-medium text-gray-900">
                {formatTime(recommendation.phase_times.sunset)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Civil Dusk</span>
              <span className="font-medium text-gray-900">
                {formatTime(recommendation.phase_times.civil_dusk)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Route Midpoint */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">🌍</span>
          Route Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Midpoint</div>
            <div className="font-medium text-gray-900">
              {recommendation.midpoint.lat.toFixed(1)}°, {recommendation.midpoint.lon.toFixed(1)}°
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Sun at Midpoint</div>
            <div className="font-medium text-gray-900">
              {formatAngle(recommendation.midpoint.sun_azimuth_deg)}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Stability</div>
            <div className={`font-medium ${
              recommendation.stability === 'HIGH' ? 'text-green-600' :
              recommendation.stability === 'MEDIUM' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {recommendation.stability}
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Explanation */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">📊</span>
          Confidence Bands
        </h3>
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
            <span><strong>HIGH:</strong> |Δ| ∈ [45°, 135°] - Sun clearly to one side</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
            <span><strong>MEDIUM:</strong> |Δ| ∈ [15°, 45°] ∪ [135°, 165°] - Moderate sun angle</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></div>
            <span><strong>LOW:</strong> |Δ| &lt; 15° or |Δ| &gt; 150° - Sun ahead/behind flight path</span>
          </div>
        </div>
      </div>
    </div>
  );
}



