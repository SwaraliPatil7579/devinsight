from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.db.database import get_db
from app.models.deployment import Deployment

router = APIRouter(prefix="/deployments", tags=["deployments"])

# This defines what data the user sends when adding a deployment
class DeploymentCreate(BaseModel):
    service_name: str
    environment: str
    status: str
    branch: Optional[str] = "main"
    triggered_by: Optional[str] = "manual"
    error_message: Optional[str] = None

class DeploymentResponse(BaseModel):
    id: str
    service_name: str
    environment: str
    status: str
    branch: Optional[str]
    triggered_by: Optional[str]
    started_at: datetime
    finished_at: Optional[datetime]
    error_message: Optional[str]
    source: Optional[str]

    class Config:
        from_attributes = True

@router.get("/")
def get_all_deployments(
    status: Optional[str] = None,
    service: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Deployment)
    if status:
        query = query.filter(Deployment.status == status)
    if service:
        query = query.filter(Deployment.service_name == service)
    deployments = query.order_by(desc(Deployment.started_at)).limit(limit).all()
    return [
        {
            "id": str(d.id),
            "service_name": d.service_name,
            "environment": d.environment,
            "status": d.status,
            "branch": d.branch,
            "triggered_by": d.triggered_by,
            "started_at": d.started_at.isoformat() + "Z",
            "finished_at": (d.finished_at.isoformat() + "Z") if d.finished_at else None,
            "error_message": d.error_message,
            "source": d.source,
        }
        for d in deployments
    ]

@router.post("/")
def create_deployment(payload: DeploymentCreate, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    deployment = Deployment(
        service_name=payload.service_name,
        environment=payload.environment,
        status=payload.status,
        branch=payload.branch,
        triggered_by=payload.triggered_by,
        started_at=now,
        finished_at=now if payload.status != "running" else None,
        error_message=payload.error_message,
        source="manual"
    )
    db.add(deployment)
    db.commit()
    db.refresh(deployment)
    return {"message": "Deployment recorded", "id": str(deployment.id)}

@router.get("/services")
def get_services(db: Session = Depends(get_db)):
    """Returns list of unique service names — used to populate dropdowns"""
    services = db.query(Deployment.service_name).distinct().all()
    return [s[0] for s in services]