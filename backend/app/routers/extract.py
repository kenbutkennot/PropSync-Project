import uuid
from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_current_agent_id
from app.schemas import ExtractRequest, ExtractedListingOut
from app.services.gemini_extractor import extract_listing
from app.services.geocoder import geocode_address

router = APIRouter(prefix="/extract", tags=["extract"])


@router.post("", response_model=ExtractedListingOut)
async def extract_from_text(payload: ExtractRequest, agent_id: uuid.UUID = Depends(get_current_agent_id)):
    """Turns raw owner text (e.g. a pasted WhatsApp message) into a
    structured listing draft. This does NOT save anything - the frontend
    shows the result in an editable form and the agent explicitly saves it
    via POST /properties, same as manual entry."""
    try:
        listing = await extract_listing(payload.raw_text)
    except Exception as exc:  # noqa: BLE001 - surface a clean 502 to the client
        raise HTTPException(status_code=502, detail=f"Extraction failed: {exc}")

    return listing


@router.get("/geocode")
async def geocode(address: str, agent_id: uuid.UUID = Depends(get_current_agent_id)):
    result = await geocode_address(address)
    if result is None:
        raise HTTPException(status_code=404, detail="Could not geocode address")
    lat, lng = result
    return {"latitude": lat, "longitude": lng}