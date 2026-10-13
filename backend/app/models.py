import uuid
from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base

class Org(Base):
    __tablename__ = "orgs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    agents = relationship("Agent", back_populates="org")
    properties = relationship("Property", back_populates="org")


class Agent(Base):
    __tablename__ = "agents"

    id = Column(UUID(as_uuid=True), primary_key=True)  # == auth.users.id
    org_id = Column(UUID(as_uuid=True), ForeignKey("orgs.id"), nullable=False, index=True)
    email = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    org = relationship("Org", back_populates="agents")


class Property(Base):
    __tablename__ = "properties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("orgs.id"), nullable=False, index=True)
    created_by_agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True)

    proposal_title = Column(String, nullable=False)
    listing_status = Column(String, nullable=True)
    area = Column(String, nullable=True)
    category = Column(String, nullable=True)
    vertical_proposal = Column(String, nullable=True)
    horizontal_proposal = Column(String, nullable=True)
    agent_name = Column(String, nullable=True)
    source_info = Column(String, nullable=True)
    proposed_to = Column(String, nullable=True)
    lot_no = Column(String, nullable=True)
    zoning = Column(String, nullable=True)
    land_use = Column(String, nullable=True)
    tenure = Column(String, nullable=True)
    other_info_1 = Column(Text, nullable=True)
    plot_ratio_density = Column(String, nullable=True)
    hectare = Column(Float, nullable=True)
    acre = Column(Float, nullable=True)
    sqft = Column(Float, nullable=True)
    sqm = Column(Float, nullable=True)
    asking_psf = Column(Float, nullable=True)
    total_price = Column(Float, nullable=True)
    mukim = Column(String, nullable=True)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    township = Column(String, nullable=True)
    comm_percent = Column(Float, nullable=True)
    comm = Column(Float, nullable=True)
    other_info_2 = Column(Text, nullable=True)

    location = Column(Geometry(geometry_type="POINT", srid=4326), nullable=True)
    boundary = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)

    source = Column(String, default="manual")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    org = relationship("Org", back_populates="properties")