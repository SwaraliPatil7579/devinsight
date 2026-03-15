from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.database import get_db
from app.models.deployment import Deployment

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/github")
async def github_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    if payload.get("action") not in ["completed"]:
        return {"status": "ignored"}
    run = payload.get("workflow_run", {})
    deployment = Deployment(
        service_name=payload.get("repository", {}).get("name", "unknown"),
        environment="production",
        status="success" if run.get("conclusion") == "success" else "failed",
        branch=run.get("head_branch"),
        commit_hash=run.get("head_sha", "")[:40],
        triggered_by=run.get("triggering_actor", {}).get("login"),
        started_at=datetime.fromisoformat(run["created_at"].replace("Z", "+00:00")) if run.get("created_at") else datetime.utcnow(),
        finished_at=datetime.fromisoformat(run["updated_at"].replace("Z", "+00:00")) if run.get("updated_at") else None,
        source="github_actions"
    )
    db.add(deployment)
    db.commit()
    return {"status": "recorded", "deployment_id": str(deployment.id)}

@router.post("/jenkins")
async def jenkins_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    status_map = {"SUCCESS": "success", "FAILURE": "failed", "ABORTED": "failed", "UNSTABLE": "failed"}
    deployment = Deployment(
        service_name=payload.get("name", "unknown"),
        environment=payload.get("environment", "production"),
        status=status_map.get(payload.get("build", {}).get("status", ""), "failed"),
        branch=payload.get("build", {}).get("scm", {}).get("branch", ""),
        triggered_by=payload.get("build", {}).get("parameters", {}).get("triggered_by"),
        source="jenkins"
    )
    db.add(deployment)
    db.commit()
    return {"status": "recorded"}