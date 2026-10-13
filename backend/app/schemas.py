import uuid
from typing import Optional
from pydantic import BaseModel, Field


class PropertyBase(BaseModel):
    proposal_title: str
    listing_status: Optional[str] = None
    area: Optional[str] = None
    category: Optional[str] = None
    vertical_proposal: Optional[str] = None
    horizontal_proposal: Optional[str] = None
    agent_name: Optional[str] = None
    source_info: Optional[str] = None
    proposed_to: Optional[str] = None
    lot_no: Optional[str] = None
    zoning: Optional[str] = None
    land_use: Optional[str] = None
    tenure: Optional[str] = None
    other_info_1: Optional[str] = None
    plot_ratio_density: Optional[str] = None
    hectare: Optional[float] = None
    acre: Optional[float] = None
    sqft: Optional[float] = None
    sqm: Optional[float] = None
    asking_psf: Optional[float] = None
    total_price: Optional[float] = None
    mukim: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    township: Optional[str] = None
    comm_percent: Optional[float] = None
    comm: Optional[float] = None
    other_info_2: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    boundary: Optional[list[tuple[float, float]]] = None


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    proposal_title: Optional[str] = None
    listing_status: Optional[str] = None
    area: Optional[str] = None
    category: Optional[str] = None
    vertical_proposal: Optional[str] = None
    horizontal_proposal: Optional[str] = None
    agent_name: Optional[str] = None
    source_info: Optional[str] = None
    proposed_to: Optional[str] = None
    lot_no: Optional[str] = None
    zoning: Optional[str] = None
    land_use: Optional[str] = None
    tenure: Optional[str] = None
    other_info_1: Optional[str] = None
    plot_ratio_density: Optional[str] = None
    hectare: Optional[float] = None
    acre: Optional[float] = None
    sqft: Optional[float] = None
    sqm: Optional[float] = None
    asking_psf: Optional[float] = None
    total_price: Optional[float] = None
    mukim: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    township: Optional[str] = None
    comm_percent: Optional[float] = None
    comm: Optional[float] = None
    other_info_2: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    boundary: Optional[list[tuple[float, float]]] = None


class PropertyOut(PropertyBase):
    id: uuid.UUID
    source: str

    model_config = {"from_attributes": True}


class ExtractRequest(BaseModel):
    raw_text: str = Field(..., min_length=1, description="Raw WhatsApp/SMS/email text from an owner")

class ExtractedListingOut(BaseModel):
    """What /extract actually returns to the frontend - same fields as
    ExtractedListing but with numerics cast to real float/None instead of
    strings, so the response matches PropertyDraft's shape on the client."""

    proposal_title: str = ""
    category: Optional[str] = None
    area: Optional[str] = None
    township: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    mukim: Optional[str] = None
    zoning: Optional[str] = None
    land_use: Optional[str] = None
    tenure: Optional[str] = None
    lot_no: Optional[str] = None
    total_price: Optional[float] = None
    asking_psf: Optional[float] = None
    sqft: Optional[float] = None
    sqm: Optional[float] = None
    acre: Optional[float] = None
    hectare: Optional[float] = None
    other_info_2: Optional[str] = None
    confidence_notes: Optional[str] = None


class ExtractedListing(BaseModel):
    """Schema the LLM is forced to return via structured output. Every field
    is a plain string (Gemini's structured-output schema rejects Optional's
    implicit null type) - numeric fields get cast to float in
    gemini_extractor.py after the response comes back, empty string means
    'not mentioned'. Nothing here is trusted until the agent reviews it in
    the UI and hits Save, and it is re-validated against PropertyCreate
    server-side before it ever touches the database."""

    proposal_title: str = ""
    category: str = ""
    area: str = ""
    township: str = ""
    district: str = ""
    state: str = ""
    mukim: str = ""
    zoning: str = ""
    land_use: str = ""
    tenure: str = ""
    lot_no: str = ""
    total_price: str = ""
    asking_psf: str = ""
    sqft: str = ""
    sqm: str = ""
    acre: str = ""
    hectare: str = ""
    other_info_2: str = ""  # free-text notes
    confidence_notes: str = Field(
        "", description="Anything the model was unsure about or had to guess"
    )


class CsvImportResult(BaseModel):
    total_rows: int
    imported: int
    skipped: int
    errors: list[str]