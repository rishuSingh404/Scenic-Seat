# Scenic Seat FastAPI Application
import os
import json
from datetime import datetime
from typing import Union
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import fastapi
import pydantic
import astral
import geopy
import dateutil
import reportlab

from api_schemas import (
    HealthResponse, RecommendationRequest, RecommendationResponse, 
    ErrorResponse, ExportPdfRequest
)
from utils import (
    bearing_gc, sun_azimuth_at, phase_times, golden_hour_flag, 
    midpoint, seat_decision, normalize180
)
from pdf_export import generate_pdf

# Load city database
with open('citydb.json', 'r') as f:
    CITY_DB = json.load(f)['cities']

# Create city lookup by name (case-insensitive)
CITY_LOOKUP = {city['name'].lower(): city for city in CITY_DB}

# Initialize FastAPI app
app = FastAPI(
    title="Scenic Seat API",
    description="Window seat recommendations for flights based on solar position",
    version="1.0.0"
)

# CORS configuration based on environment variable
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN] if FRONTEND_ORIGIN != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def find_city(name: str) -> dict:
    """Find city in database by name (case-insensitive)."""
    city = CITY_LOOKUP.get(name.lower())
    if not city:
        raise HTTPException(
            status_code=400,
            detail={"error": "GEO_ERROR", "message": f"City '{name}' not found in database"}
        )
    return city


def calculate_stability(departure_decision: dict, midpoint_decision: dict, 
                       departure_delta: float, midpoint_delta: float) -> str:
    """Calculate stability classification based on departure vs midpoint analysis."""
    
    # If seat side differs between departure and midpoint, stability is LOW
    if (departure_decision["side"] != "EITHER" and 
        midpoint_decision["side"] != "EITHER" and
        departure_decision["side"] != midpoint_decision["side"]):
        return "LOW"
    
    # If either has low confidence due to sun being ahead/behind, stability is LOW
    if abs(departure_delta) < 15 or abs(departure_delta) > 150:
        return "LOW"
    if abs(midpoint_delta) < 15 or abs(midpoint_delta) > 150:
        return "LOW"
    
    # If crossing confidence band boundaries, stability is MEDIUM
    departure_abs = abs(departure_delta)
    midpoint_abs = abs(midpoint_delta)
    
    # Define confidence band boundaries
    if ((departure_abs < 45 and midpoint_abs >= 45) or
        (departure_abs >= 45 and midpoint_abs < 45) or
        (departure_abs <= 135 and midpoint_abs > 135) or
        (departure_abs > 135 and midpoint_abs <= 135)):
        return "MEDIUM"
    
    # Otherwise, stability is HIGH
    return "HIGH"


@app.get("/")
def root():
    return {"message": "Scenic Seat API", "version": "1.0.0"}


@app.get("/healthz", response_model=HealthResponse)
def health_check():
    """Health check endpoint that returns library versions and status."""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        libraries={
            "fastapi": fastapi.__version__,
            "pydantic": pydantic.VERSION,
            "astral": astral.__version__,
            "geopy": geopy.__version__,
            "python-dateutil": dateutil.__version__,
            "reportlab": reportlab.Version
        },
        timestamp=datetime.utcnow().isoformat() + "Z"
    )


@app.post("/recommend", response_model=Union[RecommendationResponse, ErrorResponse])
def get_recommendation(request: RecommendationRequest):
    """Generate seat recommendation based on flight route and solar position."""
    
    try:
        # Validate cities exist in database
        origin_city = find_city(request.origin.name)
        dest_city = find_city(request.destination.name)
        
        # Use coordinates from request (may differ from database for testing)
        origin_lat, origin_lon = request.origin.lat, request.origin.lon
        dest_lat, dest_lon = request.destination.lat, request.destination.lon
        origin_tz = request.origin.tz
        
        # Calculate flight bearing
        flight_bearing = bearing_gc(origin_lat, origin_lon, dest_lat, dest_lon)
        
        # Calculate sun position at departure
        try:
            sun_az = sun_azimuth_at(origin_lat, origin_lon, origin_tz, request.local_datetime)
        except Exception as e:
            # Handle polar day/night or undefined sun cases
            if "polar" in str(e).lower() or "sun" in str(e).lower():
                raise HTTPException(
                    status_code=400,
                    detail={"error": "POLAR_DAY", "message": "Sun position undefined during polar day/night"}
                )
            else:
                raise HTTPException(
                    status_code=400,
                    detail={"error": "UNDEFINED_SUN", "message": f"Could not calculate sun position: {str(e)}"}
                )
        
        # DEBUG: Print the key values for seat decision
        print(f"DEBUG: Origin: {request.origin.name} ({origin_lat}, {origin_lon})")
        print(f"DEBUG: Destination: {request.destination.name} ({dest_lat}, {dest_lon})")
        print(f"DEBUG: Flight Bearing: {flight_bearing}°")
        print(f"DEBUG: Sun Azimuth: {sun_az}°")
        print(f"DEBUG: Interest: {request.interest}")
        print(f"DEBUG: Local Time: {request.local_datetime}")
        
        # Make seat decision
        decision = seat_decision(flight_bearing, sun_az)
        
        # DEBUG: Print the seat decision
        print(f"DEBUG: Seat Decision: {decision}")
        
        # Calculate solar phase times
        try:
            phases = phase_times(origin_lat, origin_lon, origin_tz, request.local_datetime)
            # If any phase is None, we're in polar conditions
            if any(time is None for time in phases.values()):
                raise HTTPException(
                    status_code=400,
                    detail={"error": "POLAR_DAY", "message": "Solar phases undefined during polar day/night"}
                )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail={"error": "UNDEFINED_SUN", "message": f"Could not calculate solar phases: {str(e)}"}
            )
        
        # Check golden hour
        is_golden_hour = golden_hour_flag(origin_lat, origin_lon, origin_tz, request.local_datetime, request.interest)
        
        # Calculate route midpoint and sun position there
        mid_lat, mid_lon = midpoint(origin_lat, origin_lon, dest_lat, dest_lon)
        try:
            mid_sun_az = sun_azimuth_at(mid_lat, mid_lon, origin_tz, request.local_datetime)
        except Exception:
            # If midpoint sun calculation fails, use departure sun position
            mid_sun_az = sun_az
        
        # Calculate stability
        mid_decision = seat_decision(flight_bearing, mid_sun_az)
        stability = calculate_stability(
            decision, mid_decision, 
            decision["angle"], mid_decision["angle"]
        )
        
        # Build response
        response = RecommendationResponse(
            side=decision["side"],
            confidence=decision["confidence"],
            bearing_deg=round(flight_bearing, 1),
            sun_azimuth_deg=round(sun_az, 1),
            relative_angle_deg=round(decision["angle"], 1),
            golden_hour=is_golden_hour,
            phase_times=phases,
            midpoint={
                "lat": round(mid_lat, 1),
                "lon": round(mid_lon, 1),
                "sun_azimuth_deg": round(mid_sun_az, 1)
            },
            stability=stability,
            notes=decision["notes"] + "; departure snapshot; great-circle assumption."
        )
        
        print(f"DEBUG: Final Response Side: {response.side}")
        return response
        
    except HTTPException:
        # Re-raise HTTP exceptions (our error responses)
        raise
    except Exception as e:
        # Catch any other unexpected errors
        raise HTTPException(
            status_code=400,
            detail={"error": "VALIDATION", "message": f"Request validation failed: {str(e)}"}
        )


@app.post("/export-pdf")
def export_pdf(request: ExportPdfRequest):
    """Export recommendation as PDF with optional map image."""
    
    try:
        # Generate PDF
        pdf_bytes = generate_pdf(
            recommendation=request.recommendation,
            map_png_base64=request.map_png_base64 if request.map_png_base64 else None
        )
        
        # Return PDF as response
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=scenic_seat_recommendation.pdf"
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "VALIDATION", "message": f"PDF generation failed: {str(e)}"}
        )
