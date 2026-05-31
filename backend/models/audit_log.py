from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func, Identity
from sqlalchemy.orm import relationship
from database.base import Base


class AuditLog(Base):
    __tablename__ = 'audit_logs'

    audit_id = Column(Integer, Identity(), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    action = Column(String(100), nullable=False)
    entity = Column(String(100), nullable=False)
    entity_id = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship('User')
