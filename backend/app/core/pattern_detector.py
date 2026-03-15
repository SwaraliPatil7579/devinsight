from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from app.models.deployment import Deployment
from collections import defaultdict

def find_recurring_failures(db: Session, days: int = 60) -> list:
    """Finds services that fail repeatedly — the real diagnostic gold"""
    since = datetime.utcnow() - timedelta(days=days)
    failed_deployments = db.query(Deployment).filter(
        and_(Deployment.started_at >= since, Deployment.status == "failed")
    ).all()
    service_failures = defaultdict(list)
    for d in failed_deployments:
        service_failures[d.service_name].append(d)
    patterns = []
    for service, failures in service_failures.items():
        if len(failures) >= 3:
            patterns.append({
                "service": service,
                "failure_count": len(failures),
                "first_seen": str(failures[0].started_at),
                "last_seen": str(failures[-1].started_at),
                "risk_level": "high" if len(failures) >= 7 else "medium"
            })
    return sorted(patterns, key=lambda x: x["failure_count"], reverse=True)