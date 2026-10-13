from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import properties, extract, csv_import

app = FastAPI(title="PropSync API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(properties.router)
app.include_router(extract.router)
app.include_router(csv_import.router)


@app.get("/health")
def health():
    return {"status": "ok"}
