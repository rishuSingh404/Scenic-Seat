# Pure math and policy functions for Scenic Seat
# All angles in degrees, 0° = North, clockwise positive
# Global convention: Δ = wrap_to_(-180, 180] of (sun_azimuth - flight_bearing)

import math
from datetime import datetime
from dateutil import tz
from astral import LocationInfo
from astral.sun import sun, golden_hour
from typing import Dict, Tuple


def bearing_gc(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate great-circle bearing from point 1 to point 2.
    Returns initial forward azimuth in degrees (0° = North, clockwise positive).
    """
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlon_rad = math.radians(lon2 - lon1)
    
    # Great circle bearing formula
    y = math.sin(dlon_rad) * math.cos(lat2_rad)
    x = (math.cos(lat1_rad) * math.sin(lat2_rad) - 
         math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(dlon_rad))
    
    # Calculate bearing in radians, then convert to degrees
    bearing_rad = math.atan2(y, x)
    bearing_deg = math.degrees(bearing_rad)
    
    # Normalize to [0, 360) then return as 0° = North convention
    return (bearing_deg + 360) % 360


def normalize180(x: float) -> float:
    """
    Normalize angle to (-180, 180] degrees.
    """
    # Use modulo to get to (-360, 360), then adjust to (-180, 180]
    result = x % 360
    if result > 180:
        result -= 360
    elif result <= -180:
        result += 360
    return result


def sun_azimuth_at(lat: float, lon: float, tz_str: str, local_dt_iso: str) -> float:
    """
    Calculate sun azimuth at given location and time.
    Returns azimuth in degrees (0° = North, clockwise positive).
    """
    # Parse timezone-aware datetime
    timezone = tz.gettz(tz_str)
    dt = datetime.fromisoformat(local_dt_iso.replace('Z', '+00:00'))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone)
    
    # Calculate sun position using astral
    from astral import Observer
    observer = Observer(latitude=lat, longitude=lon, elevation=0)
    
    # Get sun azimuth (astral returns 0° = North, clockwise positive - matches our convention)
    from astral.sun import azimuth
    sun_az = azimuth(observer, dt)
    
    return sun_az


def phase_times(lat: float, lon: float, tz_str: str, local_dt_iso: str) -> dict:
    """
    Calculate solar phase times for given location, timezone and date.
    Returns dict with ISO format times in the specified timezone.
    """
    # Parse date from input
    timezone = tz.gettz(tz_str)
    dt = datetime.fromisoformat(local_dt_iso.replace('Z', '+00:00'))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone)
    
    # Create location with actual coordinates
    location = LocationInfo(latitude=lat, longitude=lon)
    location.timezone = tz_str
    
    try:
        # Calculate sun times for the date
        from astral.sun import sun
        sun_times = sun(location.observer, date=dt.date(), tzinfo=timezone)
        
        return {
            "civil_dawn": sun_times['dawn'].isoformat(),
            "sunrise": sun_times['sunrise'].isoformat(),
            "sunset": sun_times['sunset'].isoformat(), 
            "civil_dusk": sun_times['dusk'].isoformat()
        }
    except Exception:
        # Handle polar day/night cases
        return {
            "civil_dawn": None,
            "sunrise": None,
            "sunset": None,
            "civil_dusk": None
        }


def golden_hour_flag(lat: float, lon: float, tz_str: str, local_dt_iso: str, interest: str) -> bool:
    """
    Determine if time is within golden hour for given interest.
    Golden hour is ±45 minutes around sunrise/sunset.
    """
    timezone = tz.gettz(tz_str)
    dt = datetime.fromisoformat(local_dt_iso.replace('Z', '+00:00'))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone)
    
    # Create location with actual coordinates
    location = LocationInfo(latitude=lat, longitude=lon)
    location.timezone = tz_str
    
    try:
        from astral.sun import sun
        sun_times = sun(location.observer, date=dt.date(), tzinfo=timezone)
        
        if interest.lower() == 'sunrise':
            target_time = sun_times['sunrise']
        elif interest.lower() == 'sunset':
            target_time = sun_times['sunset']
        else:
            return False
        
        # Check if within ±45 minutes of target time
        time_diff = abs((dt - target_time).total_seconds())
        return time_diff <= 45 * 60  # 45 minutes in seconds
        
    except Exception:
        return False


def midpoint(lat1: float, lon1: float, lat2: float, lon2: float) -> tuple[float, float]:
    """
    Calculate great-circle midpoint between two points.
    Returns (lat, lon) of midpoint.
    """
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlon = lon2_rad - lon1_rad
    
    # Midpoint calculation
    Bx = math.cos(lat2_rad) * math.cos(dlon)
    By = math.cos(lat2_rad) * math.sin(dlon)
    
    lat_mid_rad = math.atan2(
        math.sin(lat1_rad) + math.sin(lat2_rad),
        math.sqrt((math.cos(lat1_rad) + Bx) ** 2 + By ** 2)
    )
    
    lon_mid_rad = lon1_rad + math.atan2(By, math.cos(lat1_rad) + Bx)
    
    # Convert back to degrees
    lat_mid = math.degrees(lat_mid_rad)
    lon_mid = math.degrees(lon_mid_rad)
    
    # Normalize longitude to [-180, 180]
    lon_mid = normalize180(lon_mid)
    
    return (lat_mid, lon_mid)


def seat_decision(bearing: float, sun: float) -> dict:
    """
    Make seat recommendation based on bearing and sun azimuth.
    Returns dict with keys: side, angle (Δ), confidence, notes
    
    Global convention: Δ = wrap_to_(-180, 180] of (sun_azimuth - flight_bearing)
    Decision policy: Δ>0 ⇒ RIGHT, Δ<0 ⇒ LEFT, |Δ|<15° or |Δ|>150° ⇒ EITHER/Low
    Confidence: High |Δ| ∈ [45°,135°], Medium |Δ| ∈ [15°,45°] ∪ [135°,165°], Low otherwise
    """
    # Calculate relative angle Δ = sun_azimuth - flight_bearing
    delta = normalize180(sun - bearing)
    
    # DEBUG: Print the calculation details
    print(f"DEBUG: seat_decision - Flight Bearing: {bearing}°, Sun Azimuth: {sun}°")
    print(f"DEBUG: seat_decision - Raw Delta (sun - bearing): {sun - bearing}°")
    print(f"DEBUG: seat_decision - Normalized Delta: {delta}°")
    
    # Determine side
    if abs(delta) < 15 or abs(delta) > 150:
        side = "EITHER"
        confidence = "LOW"
        if abs(delta) < 15:
            notes = "Sun roughly ahead of flight path"
        else:
            notes = "Sun roughly behind flight path"
    elif delta > 0:
        side = "RIGHT"
        notes = "Sun on right side of flight path"
    else:
        side = "LEFT" 
        notes = "Sun on left side of flight path"
    
    # Determine confidence (if not already set to LOW)
    if side != "EITHER":
        abs_delta = abs(delta)
        if 45 <= abs_delta <= 135:
            confidence = "HIGH"
        elif (15 <= abs_delta < 45) or (135 < abs_delta <= 165):
            confidence = "MEDIUM"
        else:
            confidence = "LOW"
    
    print(f"DEBUG: seat_decision - Final Decision: Side={side}, Confidence={confidence}, Notes='{notes}'")
    
    return {
        "side": side,
        "angle": delta,
        "confidence": confidence,
        "notes": notes
    }
