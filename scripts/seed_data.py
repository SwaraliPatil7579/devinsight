import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from datetime import datetime, timedelta
import random
from app.db.database import SessionLocal, engine
from app.models.deployment import Deployment
from app.db.database import Base

Base.metadata.create_all(bind=engine)

SERVICES = ["auth-service", "payment-api", "user-service", "notification-service", "api-gateway"]
BRANCHES = ["main", "develop", "feature/new-login", "hotfix/payment-bug"]
ENVIRONMENTS = ["production", "staging"]

def seed():
    db = SessionLocal()
    print("Seeding deployment data...")
    for i in range(200):
        days_ago = random.randint(0, 60)
        started = datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))
        service = random.choice(SERVICES)
        # payment-api fails more often — creates a visible pattern
        if service == "payment-api":
            status = random.choices(["success", "failed"], weights=[55, 45])[0]
        else:
            status = random.choices(["success", "failed"], weights=[85, 15])[0]
        duration = random.randint(60, 900)
        deployment = Deployment(
            service_name=service,
            environment=random.choice(ENVIRONMENTS),
            status=status,
            branch=random.choice(BRANCHES),
            commit_hash=''.join(random.choices('abcdef0123456789', k=40)),
            triggered_by=random.choice(["prachi", "swarali", "sejal", "samiksha", "shruti"]),
            started_at=started,
            finished_at=started + timedelta(seconds=duration),
            source=random.choice(["github_actions", "jenkins"]),
            error_message="Build failed: unit tests failed" if status == "failed" else None
        )
        db.add(deployment)
    db.commit()
    db.close()
    print("Done! 200 deployments seeded.")

if __name__ == "__main__":
    seed()
