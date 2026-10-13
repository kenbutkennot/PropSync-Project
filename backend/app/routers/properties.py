import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from geoalchemy2.functions import (
    ST_MakeEnvelope,
    ST_SetSRID,
    ST_MakePoint,
    ST_X,
    ST_Y,
    ST_Intersects,
    ST_GeomFromText,
    ST_Centroid,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_org_id
from app.models import Property
from app.schemas import PropertyCreate, PropertyOut, PropertyUpdate

router = APIRouter(prefix="/properties", tags=["properties"])


def _point(lat: float | None, lng: float | None):
    if lat is None or lng is None:
        return None
    return ST_SetSRID(ST_MakePoint(lng, lat), 4326)  # PostGIS is (x=lng, y=lat)


def _polygon(points: list[tuple[float, float]] | None):
    if not points:
        return None
    ring = ", ".join(f"{lng} {lat}" for lat, lng in points)
    first = f"{points[0][1]} {points[0][0]}"
    if not ring.endswith(first):
        ring += f", {first}"
    return ST_GeomFromText(f"POLYGON(({ring}))", 4326)


def _to_out(prop: Property, db: Session) -> PropertyOut:
    lat = lng = None
    if prop.location is not None:
        lng, lat = db.execute(select(ST_X(prop.location), ST_Y(prop.location))).one()

    boundary = None
    if prop.boundary is not None:
        # Read the polygon back out as [[lat, lng], ...] via PostGIS ST_DumpPoints
        from geoalchemy2.functions import ST_DumpPoints

        rows = db.execute(
            select(ST_X((ST_DumpPoints(prop.boundary)).geom), ST_Y((ST_DumpPoints(prop.boundary)).geom))
        ).all()
        boundary = [[lat_, lng_] for lng_, lat_ in rows] if rows else None

    return PropertyOut(
        id=prop.id,
        proposal_title=prop.proposal_title,
        listing_status=prop.listing_status,
        area=prop.area,
        category=prop.category,
        vertical_proposal=prop.vertical_proposal,
        horizontal_proposal=prop.horizontal_proposal,
        agent_name=prop.agent_name,
        source_info=prop.source_info,
        proposed_to=prop.proposed_to,
        lot_no=prop.lot_no,
        zoning=prop.zoning,
        land_use=prop.land_use,
        tenure=prop.tenure,
        other_info_1=prop.other_info_1,
        plot_ratio_density=prop.plot_ratio_density,
        hectare=prop.hectare,
        acre=prop.acre,
        sqft=prop.sqft,
        sqm=prop.sqm,
        asking_psf=prop.asking_psf,
        total_price=prop.total_price,
        mukim=prop.mukim,
        district=prop.district,
        state=prop.state,
        township=prop.township,
        comm_percent=prop.comm_percent,
        comm=prop.comm,
        other_info_2=prop.other_info_2,
        latitude=lat,
        longitude=lng,
        boundary=boundary,
        source=prop.source,
    )


@router.get("", response_model=list[PropertyOut])
def list_properties(
    db: Session = Depends(get_db),
    org_id: uuid.UUID = Depends(get_current_org_id),
    min_lat: float | None = Query(None),
    min_lng: float | None = Query(None),
    max_lat: float | None = Query(None),
    max_lng: float | None = Query(None),
):
    query = select(Property).where(Property.org_id == org_id)

    if None not in (min_lat, min_lng, max_lat, max_lng):
        envelope = ST_SetSRID(ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat), 4326)
        query = query.where(ST_Intersects(Property.location, envelope))

    rows = db.execute(query).scalars().all()
    return [_to_out(p, db) for p in rows]


@router.post("", response_model=PropertyOut, status_code=201)
def create_property(
    payload: PropertyCreate,
    db: Session = Depends(get_db),
    org_id: uuid.UUID = Depends(get_current_org_id),
):
    boundary_geom = _polygon(payload.boundary)
    location_geom = _point(payload.latitude, payload.longitude)

    prop = Property(
        org_id=org_id,
        location=location_geom,
        boundary=boundary_geom,
        **payload.model_dump(exclude={"latitude", "longitude", "boundary"}),
    )
    existing = db.execute(
        select(Property.id).where(
            Property.org_id == org_id,
            Property.lot_no == payload.lot_no if payload.lot_no else Property.proposal_title == payload.proposal_title,
        ).limit(1)
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="A property with this Lot No / title already exists")
    
    db.add(prop)
    db.flush()

    if boundary_geom is not None and location_geom is None:
        prop.location = (
            select(ST_Centroid(Property.boundary)).where(Property.id == prop.id).scalar_subquery()
        )

    db.commit()
    db.refresh(prop)
    return _to_out(prop, db)


@router.patch("/{property_id}", response_model=PropertyOut)
def update_property(
    property_id: uuid.UUID,
    payload: PropertyUpdate,
    db: Session = Depends(get_db),
    org_id: uuid.UUID = Depends(get_current_org_id),
):
    prop = db.get(Property, property_id)
    if not prop or prop.org_id != org_id:
        raise HTTPException(status_code=404, detail="Property not found")

    data = payload.model_dump(exclude_unset=True)

    lat = data.pop("latitude", None)
    lng = data.pop("longitude", None)
    boundary_provided = "boundary" in data
    boundary_points = data.pop("boundary", None)

    if boundary_provided:
        if boundary_points:
            prop.boundary = _polygon(boundary_points)
            if lat is None or lng is None:
                prop.location = (
                    select(ST_Centroid(Property.boundary)).where(Property.id == prop.id).scalar_subquery()
                )
        else:
            # explicit boundary: null in the request clears it
            prop.boundary = None

    if lat is not None and lng is not None:
        prop.location = _point(lat, lng)

    for field, value in data.items():
        setattr(prop, field, value)

    db.commit()
    db.refresh(prop)
    return _to_out(prop, db)


@router.delete("/{property_id}", status_code=204)
def delete_property(
    property_id: uuid.UUID,
    db: Session = Depends(get_db),
    org_id: uuid.UUID = Depends(get_current_org_id),
):
    prop = db.get(Property, property_id)
    if not prop or prop.org_id != org_id:
        raise HTTPException(status_code=404, detail="Property not found")
    db.delete(prop)
    db.commit()