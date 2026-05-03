from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.api import analytics, webhooks, deployments, logs
from app.core.logger import push_log, logger, LOG_COLORS, RESET, BOLD, DIM, _status_color
import time
from datetime import datetime

app = FastAPI(
    title="DevInsight API",
    description="CI/CD Deployment and Reliability Analytics",
    version="1.0.0"
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    method = request.method
    path = request.url.path
    
    # Skip logging for SSE stream itself to avoid noise
    if path == "/api/logs/stream":
        return await call_next(request)
    
    response = await call_next(request)
    duration_ms = round((time.time() - start) * 1000, 1)
    status = response.status_code
    
    # Terminal log with colors
    method_color = LOG_COLORS.get(method, "")
    status_color = _status_color(status)
    timestamp = datetime.now().strftime("%H:%M:%S")
    logger.info(
        f"{DIM}{timestamp}{RESET} {method_color}{BOLD}{method:6}{RESET} "
        f"{path:40} {status_color}{status}{RESET} {DIM}{duration_ms}ms{RESET}"
    )
    
    # Push to in-memory buffer for SSE stream
    push_log({
        "timestamp": datetime.now().isoformat(),
        "method": method,
        "path": path,
        "status": status,
        "duration_ms": duration_ms,
    })
    
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(analytics.router)
app.include_router(webhooks.router)
app.include_router(deployments.router)
app.include_router(logs.router)

@app.get("/")
def root():
    return {"message": "DevInsight API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
