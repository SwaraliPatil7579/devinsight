from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.api import analytics, webhooks, deployments

app = FastAPI(
    title="DevInsight API",
    description="CI/CD Deployment and Reliability Analytics",
    version="1.0.0"
)

# CORS must be added BEFORE routers — this is critical
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Register routers AFTER middleware
from app.api import analytics, webhooks
app.include_router(analytics.router)
app.include_router(webhooks.router)

@app.get("/")
def root():
    return {"message": "DevInsight API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

app.include_router(deployments.router)