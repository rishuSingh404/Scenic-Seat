'use client';

import { useState } from 'react';

interface SeatDiagramProps {
  side: 'LEFT' | 'RIGHT' | 'EITHER';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  stability: 'HIGH' | 'MEDIUM' | 'LOW';
  sunAzimuthDeg: number;
  bearingDeg: number;
  relativeAngleDeg: number;
}

type SeatLayout = '3-3' | '2-4-2';

interface SeatRowProps {
  layout: SeatLayout;
  side: 'LEFT' | 'RIGHT' | 'EITHER';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

const confidenceColors = {
  HIGH: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-red-500'
};

const stabilityColors = {
  HIGH: 'text-green-600',
  MEDIUM: 'text-yellow-600',
  LOW: 'text-red-600'
};

const stabilityDescriptions = {
  HIGH: 'Recommendation likely to remain stable throughout the flight',
  MEDIUM: 'Recommendation may change during flight',
  LOW: 'Recommendation likely to change during flight'
};

function SeatRow({ layout, side, confidence }: SeatRowProps) {
  const getSeatStyle = (position: 'left' | 'middle' | 'right') => {
    const baseStyle = "w-8 h-8 border-2 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300";
    
    if (side === 'EITHER') {
      return `${baseStyle} border-gray-300 bg-gray-50 text-gray-400`;
    }

    if ((side === 'LEFT' && position === 'left') || (side === 'RIGHT' && position === 'right')) {
      return `${baseStyle} border-blue-500 ${confidenceColors[confidence]} text-white shadow-lg scale-110`;
    }

    return `${baseStyle} border-gray-300 bg-gray-50 text-gray-400`;
  };

  if (layout === '3-3') {
    return (
      <div className="flex justify-between items-center w-full max-w-md mx-auto">
        {/* Left section */}
        <div className="flex gap-1">
          <div className={getSeatStyle('left')}>A</div>
          <div className={getSeatStyle('left')}>B</div>
          <div className={getSeatStyle('left')}>C</div>
        </div>
        
        {/* Aisle */}
        <div className="w-8 h-8 flex items-center justify-center text-gray-400">↕</div>
        
        {/* Right section */}
        <div className="flex gap-1">
          <div className={getSeatStyle('right')}>D</div>
          <div className={getSeatStyle('right')}>E</div>
          <div className={getSeatStyle('right')}>F</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center w-full max-w-md mx-auto">
      {/* Left section */}
      <div className="flex gap-1">
        <div className={getSeatStyle('left')}>A</div>
        <div className={getSeatStyle('left')}>B</div>
      </div>
      
      {/* Middle section */}
      <div className="flex gap-1">
        <div className={getSeatStyle('middle')}>C</div>
        <div className={getSeatStyle('middle')}>D</div>
        <div className={getSeatStyle('middle')}>E</div>
        <div className={getSeatStyle('middle')}>F</div>
      </div>
      
      {/* Right section */}
      <div className="flex gap-1">
        <div className={getSeatStyle('right')}>G</div>
        <div className={getSeatStyle('right')}>H</div>
      </div>
    </div>
  );
}

export function SeatDiagram({ 
  side, 
  confidence, 
  stability,
  sunAzimuthDeg,
  bearingDeg,
  relativeAngleDeg
}: SeatDiagramProps) {
  const [layout, setLayout] = useState<SeatLayout>('3-3');
  const [showMidpointRay, setShowMidpointRay] = useState(false);

  // Calculate the angle for the sun ray visualization
  const sunRayAngle = relativeAngleDeg;
  const sunRayRotation = `rotate(${sunRayAngle}deg)`;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Seat Layout</h2>
        <div className="flex items-center gap-4">
          {/* Layout selector */}
          <select
            value={layout}
            onChange={(e) => setLayout(e.target.value as SeatLayout)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="3-3">3-3 Layout</option>
            <option value="2-4-2">2-4-2 Layout</option>
          </select>
          
          {/* Midpoint ray toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showMidpointRay}
              onChange={(e) => setShowMidpointRay(e.target.checked)}
              className="rounded text-blue-500 focus:ring-blue-500"
            />
            Show midpoint
          </label>
        </div>
      </div>

      {/* Aircraft diagram */}
      <div className="relative mb-8">
        {/* Sun ray visualization */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="w-full h-0.5 bg-yellow-400 origin-center transform transition-transform duration-300"
            style={{ transform: sunRayRotation }}
          />
          {showMidpointRay && (
            <div 
              className="w-full h-0.5 bg-yellow-400 origin-center transform transition-transform duration-300 opacity-50 border-dashed"
              style={{ transform: `${sunRayRotation} rotate(15deg)` }}
            />
          )}
        </div>

        {/* Aircraft body */}
        <div className="relative bg-gray-100 rounded-xl p-8 border-2 border-gray-300">
          {/* Nose indicator */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-gray-500">
            ▲ Front
          </div>

          {/* Seat layout */}
          <SeatRow layout={layout} side={side} confidence={confidence} />
        </div>
      </div>

      {/* Stability indicator */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Recommendation Stability</span>
          <span className={`text-sm font-bold ${stabilityColors[stability]}`}>
            {stability}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {stabilityDescriptions[stability]}
        </p>
      </div>

      {/* Technical details */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="text-gray-500">Bearing</div>
          <div className="font-mono font-medium">{bearingDeg.toFixed(1)}°</div>
        </div>
        <div>
          <div className="text-gray-500">Sun Azimuth</div>
          <div className="font-mono font-medium">{sunAzimuthDeg.toFixed(1)}°</div>
        </div>
        <div>
          <div className="text-gray-500">Relative Angle</div>
          <div className="font-mono font-medium">{relativeAngleDeg.toFixed(1)}°</div>
        </div>
      </div>
    </div>
  );
}



