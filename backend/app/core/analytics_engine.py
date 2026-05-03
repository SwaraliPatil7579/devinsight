from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from app.models.deployment import Deployment

def get_deployment_success_rate(db: Session, days: int = 30) -> dict:
    since = datetime.utcnow() - timedelta(days=days)
    total = db.query(func.count(Deployment.id)).filter(
        Deployment.started_at >= since
    ).scalar()
    successful = db.query(func.count(Deployment.id)).filter(
        and_(Deployment.started_at >= since, Deployment.status == "success")
    ).scalar()
    rate = round((successful / total * 100), 2) if total > 0 else 0
    return {"total": total, "successful": successful, "rate": rate}

def get_mttr(db: Session, days: int = 30) -> dict:
    since = datetime.utcnow() - timedelta(days=days)
    failed = db.query(Deployment).filter(
        and_(Deployment.started_at >= since, Deployment.status == "failed")
    ).order_by(Deployment.started_at).all()

    recovery_times = []
    events = []
    for failure in failed:
        next_success = db.query(Deployment).filter(
            and_(
                Deployment.service_name == failure.service_name,
                Deployment.status == "success",
                Deployment.started_at > failure.started_at,
                Deployment.started_at < failure.started_at + timedelta(hours=24)
            )
        ).order_by(Deployment.started_at).first()
        if next_success:
            delta = round((next_success.started_at - failure.started_at).total_seconds() / 60, 1)
            recovery_times.append(delta)
            events.append({
                "service": failure.service_name,
                # failed deployment evidence
                "failed_id":          str(failure.id),
                "failed_at":          failure.started_at.isoformat() + "Z",
                "failed_branch":      failure.branch or "—",
                "failed_triggered_by": failure.triggered_by or "—",
                "failed_source":      failure.source or "—",
                "error_message":      failure.error_message or None,
                # recovery deployment evidence
                "recovery_id":          str(next_success.id),
                "recovered_at":         next_success.started_at.isoformat() + "Z",
                "recovery_branch":      next_success.branch or "—",
                "recovery_triggered_by": next_success.triggered_by or "—",
                "recovery_source":      next_success.source or "—",
                # computed
                "recovery_minutes": delta,
            })

    avg_mttr = round(sum(recovery_times) / len(recovery_times), 1) if recovery_times else 0
    # sort most recent first
    events.sort(key=lambda x: x["failed_at"], reverse=True)
    return {"mttr_minutes": avg_mttr, "sample_count": len(recovery_times), "events": events}

def get_failure_trends(db: Session, days: int = 30) -> list:
    since = datetime.utcnow() - timedelta(days=days)
    all_deployments = db.query(
        Deployment.started_at,
        Deployment.status
    ).filter(Deployment.started_at >= since).all()

    from collections import defaultdict
    daily = defaultdict(lambda: {"total": 0, "failed": 0})
    for d in all_deployments:
        day = str(d.started_at.date())
        daily[day]["total"] += 1
        if d.status == "failed":
            daily[day]["failed"] += 1

    return [
        {"date": day, "total": v["total"], "failed": v["failed"]}
        for day, v in sorted(daily.items())
    ]