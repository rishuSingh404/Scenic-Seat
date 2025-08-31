# ✈️ Scenic Seat - Flight Seat Recommendation App

**Find the perfect window seat for your flight based on sun position and golden hour timing**

## 🌟 Overview

Scenic Seat is a sophisticated web application that helps travelers choose the optimal window seat based on:
- **Flight direction and bearing**
- **Sun position during flight**
- **Golden hour timing**
- **Geographic route analysis**

## 🏗️ Architecture

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **MapLibre GL JS** for interactive maps
- **React Hooks** for state management

### Backend
- **FastAPI** (Python) for API endpoints
- **Geodesic calculations** for flight paths
- **Sun position algorithms** for optimal viewing
- **JSON-based city database**

## 🧮 How Everything is Calculated

### 1. Flight Path Calculation

#### Great Circle Route
The app calculates the shortest flight path between two cities using **great circle geometry**:

```typescript
// From geodesic.ts
export function generateGreatCircleRoute(
  lat1: number,  // Origin latitude
  lon1: number,  // Origin longitude
  lat2: number,  // Destination latitude
  lon2: number,  // Destination longitude
  numPoints: number = 50
): [number, number][] {
  // Convert to radians
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  // Calculate great circle distance
  const a = Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const c = Math.acos(Math.min(1, Math.max(-1, a)));
  
  // Generate intermediate points
  const route: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * c) / Math.sin(c);
    const B = Math.sin(f * c) / Math.sin(c);
    
    const x = A * Math.cos(φ1) * Math.cos(lon1 * Math.PI / 180) + 
              B * Math.cos(φ2) * Math.cos(lon2 * Math.PI / 180);
    const y = A * Math.cos(φ1) * Math.sin(lon1 * Math.PI / 180) + 
              B * Math.cos(φ2) * Math.sin(lon2 * Math.PI / 180);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI;
    const lon = Math.atan2(y, x) * 180 / Math.PI;
    
    route.push([lon, lat]);
  }
  
  return route;
}
```

#### Bearing Calculation
**Bearing** is the compass direction from origin to destination:

```typescript
export function calculateBearing(
  lat1: number,  // Origin latitude
  lon1: number,  // Origin longitude
  lat2: number,  // Destination latitude
  lon2: number   // Destination longitude
): number {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - 
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  
  // Normalize to 0-360 degrees
  bearing = (bearing + 360) % 360;
  
  return bearing;
}
```

**What Bearing Means:**
- **0°** = North
- **90°** = East
- **180°** = South
- **270°** = West

### 2. Sun Position Calculation

#### Sun Ray Generation
The app generates a "sun ray" showing optimal viewing direction:

```typescript
export function generateSunRay(
  lat: number,      // Starting latitude
  lon: number,      // Starting longitude
  bearing: number,  // Direction to extend ray
  distance: number  // How far to extend (in degrees)
): [number, number][] {
  const ray: [number, number][] = [];
  const numPoints = 20;
  
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const d = f * distance;
    
    // Calculate new position along bearing
    const newLat = lat + (d * Math.cos(bearing * Math.PI / 180));
    const newLon = lon + (d * Math.sin(bearing * Math.PI / 180) / Math.cos(lat * Math.PI / 180));
    
    ray.push([newLon, newLat]);
  }
  
  return ray;
}
```

#### Golden Hour Timing
The app calculates optimal viewing times based on:
- **Civil Dawn**: 6° below horizon
- **Sunrise**: 0° (sun appears)
- **Sunset**: 0° (sun disappears)
- **Civil Dusk**: 6° below horizon

### 3. Seat Recommendation Algorithm

#### Flight Direction Analysis
```typescript
// Determine optimal seat side based on flight direction
function getOptimalSeatSide(flightDirection: number): 'LEFT' | 'RIGHT' {
  // Normalize flight direction to 0-360
  const normalized = (flightDirection + 360) % 360;
  
  // For eastbound flights (0° to 180°), left side gets morning sun
  // For westbound flights (180° to 360°), right side gets morning sun
  if (normalized >= 0 && normalized <= 180) {
    return 'LEFT';  // Port side for eastbound
  } else {
    return 'RIGHT'; // Starboard side for westbound
  }
}
```

#### Seat Coloring Logic
```typescript
// Color seats based on optimal viewing
function colorSeats(seats: SeatPosition[], flightDirection: number): SeatPosition[] {
  const optimalSide = getOptimalSeatSide(flightDirection);
  
  return seats.map(seat => {
    if (seat.seatType.includes('port') && optimalSide === 'LEFT') {
      seat.color = '#FFD700'; // Yellow for sunrise seats
    } else if (seat.seatType.includes('starboard') && optimalSide === 'RIGHT') {
      seat.color = '#FFD700'; // Yellow for sunrise seats
    } else if (seat.seatType.includes('window')) {
      seat.color = '#FFA500'; // Orange for sunset seats
    } else {
      seat.color = '#FFFFFF'; // White for regular seats
    }
    return seat;
  });
}
```

## 🗺️ Map Visualization

### Flight Path Display
1. **Great Circle Route**: Dashed blue line showing shortest flight path
2. **City Markers**: 
   - Blue circle for origin
   - Red circle for destination
3. **Sun Ray**: Orange dashed line showing optimal viewing direction
4. **Automatic Zoom**: Map automatically fits to show entire route

### Coordinate System
- **Latitude**: -90° (South Pole) to +90° (North Pole)
- **Longitude**: -180° (International Date Line) to +180° (Prime Meridian)
- **SVG Mapping**: Converts geographic coordinates to screen coordinates

## 🌍 City Database

### Data Structure
```typescript
interface City {
  name: string;      // City name (e.g., "Kolkata")
  iata: string;      // Airport code (e.g., "CCU")
  lat: number;       // Latitude in decimal degrees
  lon: number;       // Longitude in decimal degrees
  tz: string;        // Timezone (e.g., "Asia/Kolkata")
}
```

### Search Algorithm
```typescript
export function searchCities(query: string): City[] {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return CITIES.filter(city =>
    city.name.toLowerCase().includes(lowerQuery) ||
    city.iata.toLowerCase().includes(lowerQuery)
  ).slice(0, 20); // Return top 20 matches
}
```

## ⚡ Performance Optimizations

### React Optimizations
- **useMemo**: Caches expensive calculations (flight paths, sun rays)
- **useCallback**: Prevents unnecessary re-renders
- **React.memo**: Memoizes components that don't need frequent updates

### Map Optimizations
- **Lazy loading**: Map tiles load on demand
- **Viewport culling**: Only render visible elements
- **Debounced updates**: Limit map updates during rapid changes

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Build the app
npm run build

# Deploy to Vercel
vercel --prod
```

### Backend (Railway/Render)
```bash
# Install dependencies
pip install -r requirements.txt

# Run with production server
uvicorn app:app --host 0.0.0.0 --port $PORT
```

## 🔧 Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8003

# Backend (.env)
CORS_ORIGINS=http://localhost:3000,https://your-domain.vercel.app
```

## 📱 Features

### Core Features
- ✅ **City Search**: 100+ cities with autocomplete
- ✅ **Flight Path Visualization**: Interactive world map
- ✅ **Seat Recommendations**: Based on sun position
- ✅ **Golden Hour Timing**: Optimal viewing periods
- ✅ **Responsive Design**: Works on all devices

### Advanced Features
- ✅ **Real-time Calculations**: Dynamic updates
- ✅ **Multiple Route Support**: Save favorite routes
- ✅ **Export Functionality**: PDF route summaries
- ✅ **Performance Monitoring**: Built-in analytics

## 🧪 Testing

### Frontend Tests
```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Backend Tests
```bash
python -m pytest tests/     # Run tests
python -m pytest --cov      # Coverage
python -m pytest -v         # Verbose output
```

## 📊 API Endpoints

### POST `/recommend`
Generates seat recommendations based on flight details.

**Request:**
```json
{
  "origin": {
    "name": "Kolkata",
    "lat": 22.5726,
    "lon": 88.3639,
    "tz": "Asia/Kolkata"
  },
  "destination": {
    "name": "Singapore",
    "lat": 1.3644,
    "lon": 103.9915,
    "tz": "Asia/Singapore"
  },
  "local_datetime": "2025-09-01T06:00:00",
  "interest": "sunrise"
}
```

**Response:**
```json
{
  "side": "LEFT",
  "confidence": "HIGH",
  "bearing_deg": 135.2,
  "sun_azimuth_deg": 135.2,
  "relative_angle_deg": 0,
  "golden_hour": true,
  "phase_times": {
    "civil_dawn": "2025-09-01T04:30:00",
    "sunrise": "2025-09-01T05:15:00",
    "sunset": "2025-09-01T17:45:00",
    "civil_dusk": "2025-09-01T18:30:00"
  }
}
```

## 🔍 Troubleshooting

### Common Issues

#### Map Not Loading
- Check browser console for errors
- Verify MapLibre CSS is imported
- Check internet connection for tile loading

#### Flight Path Not Visible
- Ensure both cities are selected
- Check coordinate validity
- Verify map layers are enabled

#### City Search Not Working
- Check city database is loaded
- Verify search function is working
- Check for JavaScript errors

### Debug Mode
Enable debug logging in browser console:
```typescript
// Add to any component
console.log('DEBUG:', { originCity, destinationCity, routeData });
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **MapLibre GL JS** for map rendering
- **Tailwind CSS** for styling
- **FastAPI** for backend framework
- **Next.js** for frontend framework

---

**Built with ❤️ for travelers who love the perfect view**

*For questions or support, please open an issue on GitHub.*
#   S c e n i c - S e a t  
 