import io
import uuid

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.deps import get_current_org_id
from app.models import Property
from app.schemas import CsvImportResult
from app.services.geocoder import geocode_address
from app.routers.properties import _point

router = APIRouter(prefix="/import", tags=["import"])

# Maps normalized source CSV headers -> our schema's field names. Pandas
# normalizes duplicate headers ("Area" appears twice in the source sheet) by
# suffixing the second occurrence with ".1", which becomes "area.1" after
# our lowercase+underscore normalization below.
COLUMN_ALIASES = {
    "proposal_title": {"proposal_title"},
    "listing_status": {"listing_status"},
    "area": {"area"},
    "category": {"category"},
    "vertical_proposal": {"vertical_proposal"},
    "horizontal_proposal": {"horizontol_proposal", "horizontal_proposal"},  # source misspells "horizontol"
    "agent_name": {"agent"},
    "source_info": {"source_info"},
    "proposed_to": {"proposed_to"},
    "lot_no": {"lot_no"},
    "zoning": {"zoning"},
    "land_use": {"land_use"},
    "tenure": {"tenure"},
    "other_info_1": {"other_info"},
    "plot_ratio_density": {"plot_ratio_/_density"},
    "hectare": {"hectare"},
    "acre": {"acre"},
    "sqft": {"sqft"},
    "sqm": {"sqm"},
    "asking_psf": {"asking_psf"},
    "total_price": {"total_price"},
    "mukim": {"mukim"},
    "district": {"district"},
    "state": {"state"},
    "township": {"area.1"},
    "coordinate": {"coordinate"},
    "comm_percent": {"comm_(%)"},
    "comm": {"comm"},
    "other_info_2": {"other_info.1"},
}

NUMERIC_FIELDS = {
    "hectare", "acre", "sqft", "sqm", "asking_psf", "total_price", "comm_percent", "comm",
}


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    lower_cols = {c: c.strip().lower().replace("\n", "_").replace(" ", "_") for c in df.columns}
    df = df.rename(columns=lower_cols)

    rename_map = {}
    for canonical, aliases in COLUMN_ALIASES.items():
        for col in df.columns:
            if col in aliases and col != canonical:
                rename_map[col] = canonical
    return df.rename(columns=rename_map)


def _clean_numeric(value) -> float | None:
    """Strips currency symbols/commas (e.g. "RM71,089,920", "177,724.80")."""
    if value is None or pd.isna(value):
        return None
    text = str(value).strip()
    if not text:
        return None
    stripped = "".join(ch for ch in text if ch.isdigit() or ch == ".")
    if not stripped:
        return None
    try:
        return float(stripped)
    except ValueError:
        return None

def _find_duplicate(db: Session, org_id: uuid.UUID, lot_no: str | None, title: str, district: str | None) -> bool:
    query = select(Property.id).where(Property.org_id == org_id)
    if lot_no:
        query = query.where(Property.lot_no == lot_no)
    else:
        query = query.where(Property.proposal_title == title, Property.district == district)
    return db.execute(query.limit(1)).first() is not None

def _parse_coordinate(value) -> tuple[float, float] | None:
    if not isinstance(value, str) or "," not in value:
        return None
    try:
        lat_str, lng_str = value.split(",", 1)
        return float(lat_str.strip()), float(lng_str.strip())
    except ValueError:
        return None


@router.post("/csv", response_model=CsvImportResult)
async def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    org_id: uuid.UUID = Depends(get_current_org_id),
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file")

    raw = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(raw))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {exc}")

    df = _normalize_columns(df)
    if "proposal_title" not in df.columns:
        raise HTTPException(
            status_code=400,
            detail="CSV must include a Proposal Title column",
        )

    imported = 0
    errors: list[str] = []

    for i, row in df.iterrows():
        title = str(row.get("proposal_title", "")).strip()
        
        if not title or title.lower() == "nan":
            errors.append(f"Row {i + 2}: missing Proposal Title, skipped")
            continue

        lat = lng = None
        coord = row.get("coordinate")
        if pd.notna(coord):
            parsed = _parse_coordinate(str(coord))
            if parsed:
                lat, lng = parsed

        if lat is None or lng is None:
            fallback_address = ", ".join(
                str(row.get(f)) for f in ("township", "area", "district", "state")
                if pd.notna(row.get(f)) and str(row.get(f)).strip()
            )
            if fallback_address:
                geocoded = await geocode_address(fallback_address)
                if geocoded:
                    lat, lng = geocoded
                else:
                    errors.append(f"Row {i + 2}: could not geocode '{fallback_address}', saved without map pin")
            else:
                errors.append(f"Row {i + 2}: no Coordinate and not enough location info to geocode")

        def clean_text(key):
            val = row.get(key)
            if val is None or pd.isna(val):
                return None
            return str(val).strip() or None

        def clean_num(key):
            return _clean_numeric(row.get(key)) if key in NUMERIC_FIELDS else None

        lot_no_val = clean_text("lot_no") if "lot_no" in df.columns else None
        district_val = clean_text("district") if "district" in df.columns else None

        if _find_duplicate(db, org_id, lot_no_val, title, district_val):
            errors.append(f"Row {i + 2}: duplicate of an existing listing ('{title}'), skipped")
            continue

        prop = Property(
            org_id=org_id,
            proposal_title=title,
            listing_status=clean_text("listing_status"),
            area=clean_text("area"),
            category=clean_text("category"),
            vertical_proposal=clean_text("vertical_proposal"),
            horizontal_proposal=clean_text("horizontal_proposal"),
            agent_name=clean_text("agent_name"),
            source_info=clean_text("source_info"),
            proposed_to=clean_text("proposed_to"),
            lot_no=clean_text("lot_no"),
            zoning=clean_text("zoning"),
            land_use=clean_text("land_use"),
            tenure=clean_text("tenure"),
            other_info_1=clean_text("other_info_1"),
            plot_ratio_density=clean_text("plot_ratio_density"),
            hectare=clean_num("hectare"),
            acre=clean_num("acre"),
            sqft=clean_num("sqft"),
            sqm=clean_num("sqm"),
            asking_psf=clean_num("asking_psf"),
            total_price=clean_num("total_price"),
            mukim=clean_text("mukim"),
            district=clean_text("district"),
            state=clean_text("state"),
            township=clean_text("township"),
            comm_percent=clean_num("comm_percent"),
            comm=clean_num("comm"),
            other_info_2=clean_text("other_info_2"),
            location=_point(lat, lng),
            source="csv_import",
        )
        db.add(prop)
        imported += 1

    db.commit()

    return CsvImportResult(
        total_rows=len(df),
        imported=imported,
        skipped=len(df) - imported,
        errors=errors,
    )