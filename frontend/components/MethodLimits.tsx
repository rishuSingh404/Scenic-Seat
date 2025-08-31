'use client';

import React, { useState, useEffect } from 'react';

export function MethodLimits() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Show methodology and limitations"
      >
        <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Methodology & Limitations
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close methodology panel"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h3>Methodology</h3>
                <h4>Angle Conventions</h4>
                <ul>
                  <li>All angles are in degrees</li>
                  <li>0° points North, angles increase clockwise</li>
                  <li>Flight bearing is initial great-circle forward azimuth</li>
                  <li>Relative angle Δ = wrap_to_(-180, 180] of (sun_azimuth − flight_bearing)</li>
                </ul>

                <h4>Decision Policy</h4>
                <ul>
                  <li>Δ {'>'} 0 → RIGHT side recommendation</li>
                  <li>Δ {'<'} 0 → LEFT side recommendation</li>
                  <li>|Δ| {'<'} 15° or |Δ| {'>'} 150° → EITHER with Low confidence</li>
                </ul>

                <h4>Confidence Bands</h4>
                <ul>
                  <li>High: |Δ| ∈ [45°,135°]</li>
                  <li>Medium: |Δ| ∈ [15°,45°] ∪ [135°,165°]</li>
                  <li>Low: |Δ| {'<'} 15° or |Δ| {'>'} 165°</li>
                </ul>

                <h4>Solar Calculations</h4>
                <ul>
                  <li>Uses origin city's IANA timezone</li>
                  <li>All times are timezone-aware</li>
                  <li>Golden hour: ±45 minutes around sunrise/sunset</li>
                  <li>Phase times include civil dawn/dusk</li>
                </ul>

                <h3>Limitations</h3>
                <h4>Geographic</h4>
                <ul>
                  <li>Limited to pre-defined city database</li>
                  <li>Great-circle route assumption</li>
                  <li>No terrain/weather consideration</li>
                  <li>Polar day/night may cause undefined phases</li>
                </ul>

                <h4>Temporal</h4>
                <ul>
                  <li>±3 hour exploration limit from departure</li>
                  <li>Uses departure snapshot only</li>
                  <li>No en-route sun position updates</li>
                  <li>DST changes may affect accuracy</li>
                </ul>

                <h4>Aircraft</h4>
                <ul>
                  <li>Generic seat layouts (3-3 or 2-4-2)</li>
                  <li>No aircraft-specific configurations</li>
                  <li>No consideration of wing position</li>
                  <li>Assumes clear windows</li>
                </ul>

                <h4>Environmental</h4>
                <ul>
                  <li>No cloud cover prediction</li>
                  <li>No atmospheric conditions</li>
                  <li>Assumes unobstructed view</li>
                  <li>No ground feature consideration</li>
                </ul>

                <h3>Best Practices</h3>
                <ol>
                  <li>Use time scrubber to check stability</li>
                  <li>Consider both sunrise and sunset options</li>
                  <li>Check confidence and stability indicators</li>
                  <li>Review phase times for timing accuracy</li>
                  <li>Export PDF for offline reference</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}