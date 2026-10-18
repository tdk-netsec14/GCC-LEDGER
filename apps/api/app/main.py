from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.middleware import RequestControlMiddleware, register_exception_handlers
from app.routers import (
    ask,
    auth,
    cities,
    contradictions,
    directory,
    ingest,
    ledger,
    providers,
    radar,
    review,
    roadmap,
    simulate,
    sources,
    states,
)

settings = get_settings()


from app.ingest.scheduler import shutdown_scheduler, start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup actions
    start_scheduler()
    yield
    # Shutdown actions
    shutdown_scheduler()


app = FastAPI(
    title="GCC Ledger API",
    version="1.0.0",
    description="Evidence-graded intelligence platform for Global Capability Centres in India.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Exception handlers for unified error envelope
register_exception_handlers(app)

# Request control middleware (rate limit, size limit, structured JSON logging)
app.add_middleware(RequestControlMiddleware)

# CORS middleware
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(ledger.router)
app.include_router(contradictions.router)
app.include_router(directory.router)
app.include_router(cities.router)
app.include_router(states.router)
app.include_router(simulate.router)
app.include_router(roadmap.router)
app.include_router(radar.router)
app.include_router(providers.router)
app.include_router(sources.router)
app.include_router(auth.router)
app.include_router(review.router)
app.include_router(ingest.router)
app.include_router(ask.router)


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "gcc-ledger-api", "version": "1.0.0"}


@app.get("/", tags=["Health"])
def root() -> dict[str, str]:
    return {
        "message": "GCC Ledger Intelligence API. Sourced, evidence-graded reference for Indian GCCs.",
        "documentation": "/docs",
    }
