from sqlalchemy.orm import Session
from models.audit_log import AuditLog


class AuditService:
    def __init__(self, db: Session):
        self.db = db

    def log(self, user_id: int, action: str, entity: str, entity_id: int = None, description: str = None):
        entry = AuditLog(
            user_id=user_id,
            action=action,
            entity=entity,
            entity_id=entity_id,
            description=description,
        )
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def list_logs(self):
        return self.db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
