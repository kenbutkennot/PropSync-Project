"""Turns a blob of raw owner text (typically pasted from WhatsApp) into a
structured land/commercial listing draft using Gemini's JSON-schema-
constrained output.

Model choice: gemini-3.1-flash-lite by default - cheap, fast, has a free
tier, and this is a simple extraction task that doesn't need a reasoning
model. Swap GEMINI_MODEL in .env if you want to try something else (e.g.
gemini-2.5-flash for messier / multi-language input) - note 2.5 models are
scheduled for shutdown October 16, 2026, so don't build fresh against them.
"""

import json
import re

from google import genai
from google.genai import types

from app.config import settings
from app.schemas import ExtractedListing, ExtractedListingOut

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


EXTRACTION_PROMPT = """You are extracting structured land/commercial real-estate listing \
data from raw text an owner or source sent an agent (often a casual WhatsApp message, may \
be informal or incomplete). Extract only what is explicitly stated or very strongly \
implied - never invent a price, location, or size that isn't in the text. If a field is \
missing, return an empty string for it - never null. For numeric fields (total_price, \
asking_psf, sqft, sqm, acre, hectare) return digits only as a string, no currency symbols, \
no commas, no units (e.g. "650000" not "RM650,000"). Put anything you had to interpret or \
guess at into confidence_notes so the agent can double check it.

Text:
---
{raw_text}
---
"""


def _clean_number(raw: str) -> float | None:
    """Strips currency symbols/commas/units, returns None if nothing numeric remains."""
    if not raw:
        return None
    stripped = re.sub(r"[^0-9.]", "", raw)
    if not stripped:
        return None
    try:
        return float(stripped)
    except ValueError:
        return None


async def extract_listing(raw_text: str) -> ExtractedListingOut:
    client = _get_client()

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=EXTRACTION_PROMPT.format(raw_text=raw_text),
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ExtractedListing,
            temperature=0,
        ),
    )

    if getattr(response, "parsed", None) is not None:
        raw: ExtractedListing = response.parsed
    else:
        raw = ExtractedListing(**json.loads(response.text))

    return ExtractedListingOut(
        proposal_title=raw.proposal_title,
        category=raw.category or None,
        area=raw.area or None,
        township=raw.township or None,
        district=raw.district or None,
        state=raw.state or None,
        mukim=raw.mukim or None,
        zoning=raw.zoning or None,
        land_use=raw.land_use or None,
        tenure=raw.tenure or None,
        lot_no=raw.lot_no or None,
        total_price=_clean_number(raw.total_price),
        asking_psf=_clean_number(raw.asking_psf),
        sqft=_clean_number(raw.sqft),
        sqm=_clean_number(raw.sqm),
        acre=_clean_number(raw.acre),
        hectare=_clean_number(raw.hectare),
        other_info_2=raw.other_info_2 or None,
        confidence_notes=raw.confidence_notes or None,
    )