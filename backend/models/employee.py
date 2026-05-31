from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Identity
from sqlalchemy.orm import relationship
from database.base import Base


class Employee(Base):
    __tablename__ = 'employees'

    employee_id = Column(Integer, Identity(), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False, unique=True)
    branch_id = Column(Integer, ForeignKey('branches.branch_id'), nullable=True)
    position = Column(String(100), nullable=False, default='STAFF')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship('User', backref='employee', uselist=False)
    branch = relationship('Branch')
