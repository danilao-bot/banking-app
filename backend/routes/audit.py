from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.audit_service import AuditService
from database.connection import get_db
from schemas.audit import AuditLogResponse
from utils.auth import require_role

router = APIRouter()


@router.get('/', response_model=list[AuditLogResponse])
def list_audit_logs(current_user=Depends(require_role('ADMIN')), db: Session = Depends(get_db)):
    service = AuditService(db)
    return service.list_logs()
