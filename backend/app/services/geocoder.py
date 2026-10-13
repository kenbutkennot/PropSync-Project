"""Turns a text address into (lat, lng) using Google Maps Geocoding API.
Swapped from Mapbox because Mapbox's Malaysia street-level coverage was
unreliable (wrong town/country matches). Google's coverage is generally
much stronger for Malaysian addresses."""

import httpx

from app.config import settings

GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"


async def geocode_address(address: str) -> tuple[float, float] | None:
    if not settings.google_maps_api_key or not address:
        return None

    params = {
        "address": address,
        "key": settings.google_maps_api_key,
        # Restrict + bias results to Malaysia. Remove "region" (or change
        # both to match your actual coverage area) if agents operate
        # outside Malaysia too.
        "components": "country:MY",
        "region": "my",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(GOOGLE_GEOCODE_URL, params=params)
        resp.raise_for_status()
        data = resp.json()

    if data.get("status") != "OK" or not data.get("results"):
        return None

    location = data["results"][0]["geometry"]["location"]
    return location["lat"], location["lng"]