from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.analytics_engine import get_deployment_success_rate, get_mttr, get_failure_trends
from app.core.pattern_detector import find_recurring_failures

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/success-rate")
def success_rate(days: int = 30, db: Session = Depends(get_db)):
    return get_deployment_success_rate(db, days)

@router.get("/mttr")
def mttr(days: int = 30, db: Session = Depends(get_db)):
    return get_mttr(db, days)

@router.get("/trends")
def trends(days: int = 30, db: Session = Depends(get_db)):
    return get_failure_trends(db, days)

@router.get("/patterns")
def patterns(days: int = 60, db: Session = Depends(get_db)):
    return find_recurring_failures(db, days)