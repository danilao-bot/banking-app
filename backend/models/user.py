from sqlalchemy import Column, Integer, String, DateTime, func, Identity
from database.base import Base


class User(Base):
    __tablename__ = 'users'

    user_id = Column(Integer, Identity(), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(512), nullable=False)
    role = Column(String(50), nullable=False, default='CUSTOMER')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
