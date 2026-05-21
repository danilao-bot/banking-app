from pydantic import BaseModel
from typing import Optional


class AuditLogCreate(BaseModel):
    user_id: int
    action: str
    entity: str
    entity_id: Optional[int] = None
    description: Optional[str] = None


class AuditLogResponse(BaseModel):
    audit_id: int
    user_id: int
    action: str
    entity: str
    entity_id: Optional[int]
    description: Optional[str]

    class Config:
        orm_mode = True
