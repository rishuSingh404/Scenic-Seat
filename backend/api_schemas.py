# Strict Pydantic v2 models that mirror the frozen JSON contract exactly
# These schemas must never change - they are the frozen public HTTP contract

from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any
from datetime import datetime


class LocationModel(BaseModel):
    """Location with name, coordinates, and timezone."""
    name: str = Field(..., description="City name")
    lat: float = Field(..., description="Latitude in degrees")
    lon: float = Field(..., description="Longitude in degrees") 
    tz: str = Field(..., description="IANA timezone identifier")


class RecommendationRequest(BaseModel):
    """Request model for POST /recommend - matches frozen contract exactly."""
    origin: LocationModel = Field(..., description="Origin city")
    destination: LocationModel = Field(..., description="Destination city")
    local_datetime: str = Field(..., description="Local datetime in origin timezone (ISO format)")
    interest: Literal["sunrise", "sunset"] = Field(..., description="Interest in sunrise or sunset")

    model_config = {
        "json_schema_extra": {
            "example": {
                "origin": {"name":"Delhi","lat":28.5562,"lon":77.1000,"tz":"Asia/Kolkata"},
                "destination": {"name":"Singapore","lat":1.3644,"lon":103.9915,"tz":"Asia/Singapore"},
                "local_datetime": "2025-09-10T06:00:00",
                "interest": "sunrise"
            }
        }
    }


class PhaseTimesModel(BaseModel):
    """Solar phase times in origin timezone."""
    civil_dawn: str = Field(..., description="Civil dawn time in ISO format")
    sunrise: str = Field(..., description="Sunrise time in ISO format")
    sunset: str = Field(..., description="Sunset time in ISO format")
    civil_dusk: str = Field(..., description="Civil dusk time in ISO format")


class MidpointModel(BaseModel):
    """Route midpoint with sun position."""
    lat: float = Field(..., description="Midpoint latitude")
    lon: float = Field(..., description="Midpoint longitude")
    sun_azimuth_deg: float = Field(..., description="Sun azimuth at midpoint in degrees")


class RecommendationResponse(BaseModel):
    """Success response model for POST /recommend - matches frozen contract exactly."""
    side: Literal["LEFT", "RIGHT", "EITHER"] = Field(..., description="Recommended window side")
    confidence: Literal["HIGH", "MEDIUM", "LOW"] = Field(..., description="Confidence level")
    bearing_deg: float = Field(..., description="Flight bearing in degrees")
    sun_azimuth_deg: float = Field(..., description="Sun azimuth in degrees")
    relative_angle_deg: float = Field(..., description="Relative angle (sun - bearing)")
    golden_hour: bool = Field(..., description="Whether time is in golden hour")
    phase_times: PhaseTimesModel = Field(..., description="Solar phase times")
    midpoint: MidpointModel = Field(..., description="Route midpoint data")
    stability: Literal["HIGH", "MEDIUM", "LOW"] = Field(..., description="Stability classification")
    notes: str = Field(..., description="Explanatory notes")

    model_config = {
        "json_schema_extra": {
            "example": {
                "side": "LEFT",
                "confidence": "HIGH",
                "bearing_deg": 132.4,
                "sun_azimuth_deg": 83.1,
                "relative_angle_deg": -49.3,
                "golden_hour": True,
                "phase_times": {
                    "civil_dawn": "2025-09-10T05:32:00",
                    "sunrise": "2025-09-10T05:58:00",
                    "sunset": "2025-09-10T18:12:00",
                    "civil_dusk": "2025-09-10T18:38:00"
                },
                "midpoint": {
                    "lat": 15.1, "lon": 90.2,
                    "sun_azimuth_deg": 97.5
                },
                "stability": "HIGH",
                "notes": "Departure snapshot; great-circle assumption."
            }
        }
    }


class ErrorResponse(BaseModel):
    """Error response model - matches frozen contract exactly."""
    error: Literal["POLAR_DAY", "UNDEFINED_SUN", "VALIDATION", "GEO_ERROR"] = Field(..., description="Error type")
    message: str = Field(..., description="Human-readable error message")

    model_config = {
        "json_schema_extra": {
            "example": {
                "error": "POLAR_DAY",
                "message": "Sun does not set during polar day period"
            }
        }
    }


class ExportPdfRequest(BaseModel):
    """Request model for POST /export-pdf - matches frozen contract exactly."""
    recommendation: RecommendationResponse = Field(..., description="The exact /recommend response object")
    map_png_base64: str = Field(..., description="Map image as base64 data URI")

    model_config = {
        "json_schema_extra": {
            "example": {
                "recommendation": {
                    "side": "LEFT",
                    "confidence": "HIGH",
                    "bearing_deg": 132.4,
                    "sun_azimuth_deg": 83.1,
                    "relative_angle_deg": -49.3,
                    "golden_hour": True,
                    "phase_times": {
                        "civil_dawn": "2025-09-10T05:32:00",
                        "sunrise": "2025-09-10T05:58:00",
                        "sunset": "2025-09-10T18:12:00",
                        "civil_dusk": "2025-09-10T18:38:00"
                    },
                    "midpoint": {
                        "lat": 15.1, "lon": 90.2,
                        "sun_azimuth_deg": 97.5
                    },
                    "stability": "HIGH",
                    "notes": "Departure snapshot; great-circle assumption."
                },
                "map_png_base64": "data:image/png;base64,AAAA..."
            }
        }
    }


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    libraries: Dict[str, str] = Field(..., description="Library versions")
    timestamp: str = Field(..., description="Current timestamp")

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "healthy",
                "version": "1.0.0",
                "libraries": {
                    "fastapi": "0.104.1",
                    "pydantic": "2.5.0",
                    "astral": "3.2"
                },
                "timestamp": "2025-09-10T12:00:00Z"
            }
        }
    }

