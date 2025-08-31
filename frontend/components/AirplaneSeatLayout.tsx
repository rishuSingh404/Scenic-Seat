'use client';

import { useState, useEffect, useRef } from 'react';
import { MapView } from './MapView';
import { PdfExportButton } from './PdfExportButton';
import { RecommendationResponse } from '@/lib/schemas';

interface SeatPosition {
  row: number;
  seat: string;
  color: string;
  isWindow: boolean;
  isAisle: boolean;
  seatType: string;
}

interface AirplaneSeatLayoutProps {
  flightDirection: number;
  currentTime: string;
  departureTime: string;
  arrivalTime: string;
  flightDuration: string;
  flightStatus: string;
  originCity?: { name: string; lat: number; lon: number } | null;
  destinationCity?: { name: string; lat: number; lon: number } | null;
  recommendation?: RecommendationResponse | null;
  interestType?: 'sunrise' | 'sunset';
}

export function AirplaneSeatLayout({
  flightDirection,
  currentTime,
  departureTime,
  arrivalTime,
  flightDuration,
  flightStatus,
  originCity,
  destinationCity,
  recommendation,
  interestType
}: AirplaneSeatLayoutProps) {
  const [seats, setSeats] = useState<SeatPosition[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  // Generate seat layout
  useEffect(() => {
    const seatLayout: SeatPosition[] = [];
    
    for (let row = 1; row <= 20; row++) {
      // Left side (A, B)
      seatLayout.push({
        row,
        seat: `${row}A`,
        color: '#FFFFFF',
        isWindow: true,
        isAisle: false,
        seatType: 'port-window'
      });
      seatLayout.push({
        row,
        seat: `${row}B`,
        color: '#FFFFFF',
        isWindow: false,
        isAisle: true,
        seatType: 'port-aisle'
      });
      
      // Middle section (C, D, E, F)
      seatLayout.push({
        row,
        seat: `${row}C`,
        color: '#FFFFFF',
        isWindow: false,
        isAisle: true,
        seatType: 'center-aisle'
      });
      seatLayout.push({
        row,
        seat: `${row}D`,
        color: '#FFFFFF',
        isWindow: false,
        isAisle: false,
        seatType: 'center-middle'
      });
      seatLayout.push({
        row,
        seat: `${row}E`,
        color: '#FFFFFF',
        isWindow: false,
        isAisle: false,
        seatType: 'center-middle'
      });
      seatLayout.push({
        row,
        seat: `${row}F`,
        color: '#FFFFFF',
        isWindow: false,
        isAisle: true,
        seatType: 'center-aisle'
      });
      
      // Right side (G, H)
      seatLayout.push({
        row,
        seat: `${row}G`,
        color: '#FFFFFF',
        isWindow: false,
        isAisle: true,
        seatType: 'starboard-aisle'
      });
      seatLayout.push({
        row,
        seat: `${row}H`,
        color: '#FFFFFF',
        isWindow: true,
        isAisle: false,
        seatType: 'starboard-window'
      });
    }
    
    setSeats(seatLayout);
  }, []);

  // Color seats based on user preference (sunrise/sunset) and recommendation side
  useEffect(() => {
    // Get the optimal side from the recommendation (LEFT or RIGHT)
    const optimalSide = recommendation?.side || 'EITHER';
    
    setSeats(prev => prev.map(seat => {
      if (optimalSide === 'LEFT' && seat.seat.endsWith('A')) {
        // Left side (A seats) - color based on user preference
        return {
          ...seat,
          color: interestType === 'sunrise' ? '#FFD700' : '#FFA500' // Yellow for sunrise, Orange for sunset
        };
      } else if (optimalSide === 'RIGHT' && seat.seat.endsWith('H')) {
        // Right side (H seats) - color based on user preference
        return {
          ...seat,
          color: interestType === 'sunrise' ? '#FFD700' : '#FFA500' // Yellow for sunrise, Orange for sunset
        };
      } else {
        // Other seats remain white
        return {
          ...seat,
          color: '#FFFFFF'
        };
      }
    }));
  }, [recommendation, interestType]);

  // Handle seat selection
  const handleSeatClick = (seatId: string) => {
    setSelectedSeat(selectedSeat === seatId ? null : seatId);
  };

  // Get seat classes
  const getSeatClasses = (seat: SeatPosition) => {
    const isRecommended = seat.color === '#FFD700' || seat.color === '#FFA500';
    const isSelected = selectedSeat === seat.seat;
    
    return `
      w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-bold cursor-pointer
      transition-all duration-300 ease-out
      ${isRecommended ? 'seat-recommended' : ''}
      ${isSelected ? 'seat-selected' : ''}
      ${seat.isWindow ? 'border-blue-500 shadow-lg' : 'border-gray-300'}
      hover:scale-110 hover:shadow-xl hover:rotate-1
    `;
  };

  return (
    <div className="space-y-6">
      <style jsx>{`
        .seat-recommended {
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
        }
        .seat-selected {
          background-color: #3b82f6 !important;
          color: white !important;
          transform: scale(1.1);
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.8);
        }
        .seat-recommended:hover {
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
          transform: scale(1.15);
        }
        .seat-selected:hover {
          box-shadow: 0 0 35px rgba(59, 130, 246, 1);
        }
      `}</style>
      {/* Flight Status Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-3xl animate-bounce">✈️</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {departureTime} → {arrivalTime}
              </h2>
              <p className="text-gray-600 text-lg">
                {flightDuration} • {flightStatus}
              </p>
            </div>
          </div>
          
          {/* PDF Export Button */}
          {recommendation && (
            <div className="flex items-center">
              <PdfExportButton
                recommendation={recommendation}
                mapRef={mapRef}
                disabled={!recommendation}
              />
            </div>
          )}
        </div>
      </div>

      {/* Recommendation Card - NEW! */}
      {recommendation && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🎯</div>
              <div>
                <h3 className="text-xl font-bold text-green-800">
                  Seat Recommendation
                </h3>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-lg font-semibold text-green-700">
                    Choose {recommendation.side === 'LEFT' ? 'LEFT SIDE' : recommendation.side === 'RIGHT' ? 'RIGHT SIDE' : 'EITHER SIDE'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    recommendation.confidence === 'HIGH' ? 'bg-green-100 text-green-800' :
                    recommendation.confidence === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {recommendation.confidence} Confidence
                  </span>
                </div>
                <p className="text-green-600 mt-1">
                  {recommendation.notes}
                </p>
              </div>
            </div>
            
            {/* Visual Indicator */}
            <div className="text-center">
              <div className="text-6xl mb-2">
                {recommendation.side === 'LEFT' ? '⬅️' : 
                 recommendation.side === 'RIGHT' ? '➡️' : '↔️'}
              </div>
              <div className="text-sm text-green-600 font-medium">
                {recommendation.side === 'LEFT' ? 'A Seats (Window)' : 
                 recommendation.side === 'RIGHT' ? 'H Seats (Window)' : 'Any Window Seat'}
              </div>
            </div>
          </div>
          
          {/* Technical Details */}
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-green-600 font-medium">Flight Bearing:</span>
                <div className="text-gray-700">{recommendation.bearing_deg}°</div>
              </div>
              <div>
                <span className="text-green-600 font-medium">Sun Position:</span>
                <div className="text-gray-700">{recommendation.sun_azimuth_deg}°</div>
              </div>
              <div>
                <span className="text-green-600 font-medium">Relative Angle:</span>
                <div className="text-gray-700">{recommendation.relative_angle_deg}°</div>
              </div>
              <div>
                <span className="text-green-600 font-medium">Stability:</span>
                <div className="text-gray-700">{recommendation.stability}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flight Path Map - TOP MAP (Keep This One!) */}
      {originCity && destinationCity && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">🗺️</div>
            <h3 className="text-lg font-semibold text-gray-900">
              Flight Path & Sun Position
            </h3>
          </div>
          
          <MapView
            ref={mapRef}
            recommendation={{
              side: recommendation?.side || 'LEFT',
              confidence: 'HIGH',
              bearing_deg: flightDirection,
              sun_azimuth_deg: flightDirection,
              relative_angle_deg: 0,
              golden_hour: true,
              phase_times: {
                civil_dawn: departureTime,
                sunrise: departureTime,
                sunset: arrivalTime,
                civil_dusk: arrivalTime
              },
              midpoint: {
                lat: (originCity.lat + destinationCity.lat) / 2,
                lon: (originCity.lon + destinationCity.lon) / 2,
                sun_azimuth_deg: flightDirection
              },
              stability: 'HIGH',
              notes: `Flight from ${originCity.name} to ${destinationCity.name}`
            }}
            originCity={originCity}
            destinationCity={destinationCity}
            animate={true}
            layerConfig={{
              'flight-route': { enabled: true, opacity: 1.0 },
              'sun-ray': { enabled: true, opacity: 0.9 },
              'waypoints': { enabled: true, opacity: 1.0 },
              'flight-progress': { enabled: true, opacity: 0.9 }
            }}
          />
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>🌅 Sun position overlay shows optimal viewing direction</p>
            <p>✈️ Great circle route displays shortest flight path</p>
          </div>
        </div>
      )}

      {/* Seat Layout */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          ✈️ AIRPLANE SEAT LAYOUT
        </h3>
        
        {/* Aisle Labels */}
        <div className="flex justify-between items-center mb-6 px-8">
          <div className="text-center">
            <div className="text-sm font-semibold text-blue-600">PORT AISLE</div>
            <div className="text-xs text-gray-500">Left Side</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-purple-600">CENTER AISLE</div>
            <div className="text-xs text-gray-500">Middle Section</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-green-600">STARBOARD AISLE</div>
            <div className="text-xs text-gray-500">Right Side</div>
          </div>
        </div>
        
        <div className="flex justify-center mb-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Cockpit</div>
            <div className="w-20 h-10 bg-gradient-to-b from-gray-400 to-gray-300 rounded-t-lg mx-auto shadow-md"></div>
          </div>
        </div>

        {/* Seat Grid */}
        <div className="space-y-2">
          {Array.from({ length: 20 }, (_, rowIndex) => {
            const rowNumber = rowIndex + 1;
            const rowSeats = seats.filter(seat => seat.row === rowNumber);
            
            return (
              <div key={rowNumber} className="flex items-center justify-center space-x-1">
                <div className="text-xs text-gray-500 w-8 text-right font-medium">
                  {rowNumber}
                </div>
                <div className="flex space-x-1">
                  {/* Left Section: A, B */}
                  <div className="flex space-x-1">
                    {rowSeats.filter(seat => seat.seatType === 'port-window' || seat.seatType === 'port-aisle').map((seat) => (
                      <div
                        key={seat.seat}
                        className={getSeatClasses(seat)}
                        style={{ backgroundColor: selectedSeat === seat.seat ? '#3b82f6' : seat.color }}
                        title={`Seat ${seat.seat}`}
                        onClick={() => handleSeatClick(seat.seat)}
                      >
                        <span className={selectedSeat === seat.seat ? 'text-white' : 
                          seat.color === '#FFD700' || seat.color === '#FFA500' ? 'text-white' : 'text-gray-700'}>
                          {seat.seat.replace(rowNumber.toString(), '')}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* AISLE SPACING */}
                  <div className="w-8 flex items-center justify-center">
                    <div className="text-xs text-gray-400 font-medium">|</div>
                  </div>
                  
                  {/* Center Section: C, D, E, F */}
                  <div className="flex space-x-1">
                    {rowSeats.filter(seat => seat.seatType === 'center-aisle' || seat.seatType === 'center-middle').map((seat) => (
                      <div
                        key={seat.seat}
                        className={getSeatClasses(seat)}
                        style={{ backgroundColor: selectedSeat === seat.seat ? '#3b82f6' : seat.color }}
                        title={`Seat ${seat.seat}`}
                        onClick={() => handleSeatClick(seat.seat)}
                      >
                        <span className={selectedSeat === seat.seat ? 'text-white' : 'text-gray-700'}>
                          {seat.seat.replace(rowNumber.toString(), '')}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* AISLE SPACING */}
                  <div className="w-8 flex items-center justify-center">
                    <div className="text-xs text-gray-400 font-medium">|</div>
                  </div>
                  
                  {/* Right Section: G, H */}
                  <div className="flex space-x-1">
                    {rowSeats.filter(seat => seat.seatType === 'starboard-aisle' || seat.seatType === 'starboard-window').map((seat) => (
                      <div
                        key={seat.seat}
                        className={getSeatClasses(seat)}
                        style={{ backgroundColor: selectedSeat === seat.seat ? '#3b82f6' : seat.color }}
                        title={`Seat ${seat.seat}`}
                        onClick={() => handleSeatClick(seat.seat)}
                      >
                        <span className={selectedSeat === seat.seat ? 'text-white' : 
                          seat.color === '#FFD700' || seat.color === '#FFA500' ? 'text-white' : 'text-gray-700'}>
                          {seat.seat.replace(rowNumber.toString(), '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-6">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Galley/Lavatories</div>
            <div className="w-40 h-10 bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-lg mx-auto shadow-md"></div>
          </div>
        </div>
      </div>


    </div>
  );
}
