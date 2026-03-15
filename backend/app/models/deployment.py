from sqlalchemy import Column, String, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from app.db.database import Base

class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    service_name = Column(String(100), nullable=False)
    environment = Column(String(50), nullable=False)  # prod, staging, dev
    status = Column(String(20), nullable=False)        # success, failed, running
    branch = Column(String(100))
    commit_hash = Column(String(40))
    triggered_by = Column(String(100))
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    source = Column(String(50))  # jenkins, github_actions, bitbucket