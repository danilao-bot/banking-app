from sqlalchemy import Column, Integer, String, DateTime, func, Identity
from database.base import Base


class Branch(Base):
    __tablename__ = 'branches'

    branch_id = Column(Integer, Identity(), primary_key=True)
    name = Column(String(150), nullable=False)
    address = Column(String(400), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
