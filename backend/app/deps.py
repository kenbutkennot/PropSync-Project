"""Auth dependencies. get_current_agent_id verifies the Supabase-issued JWT
sent in the Authorization header against Supabase's public JWKS (ES256 /
asymmetric signing keys - Supabase's current default, replacing the older
shared HS256 secret) and extracts the user's UUID from the "sub" claim.
Postgres Row Level Security is the actual enforcement layer; this just
tells the API which agent is making the request.
get_current_org_id builds on it by looking up which org that agent
belongs to; every property query is scoped by org_id, not agent_id."""

import uuid
import jwt
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Agent

# PyJWKClient fetches and caches Supabase's public signing keys internally -
# one client instance reused across requests avoids refetching the JWKS on
# every call.
_jwks_client = jwt.PyJWKClient(f"{settings.supabase_url}/auth/v1/.well-known/jwks.json")


async def get_current_agent_id(authorization: str = Header(...)) -> uuid.UUID:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header")

    token = authorization.removeprefix("Bearer ").strip()
    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {exc}")

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Token missing subject claim")

    try:
        return uuid.UUID(sub)
    except ValueError:
        raise HTTPException(status_code=401, detail="Token subject is not a valid UUID")


async def get_current_org_id(
    agent_id: uuid.UUID = Depends(get_current_agent_id),
    db: Session = Depends(get_db),
) -> uuid.UUID:
    agent = db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(
            status_code=403,
            detail="This user isn't registered as an agent in any org yet.",
        )
    return agent.org_id