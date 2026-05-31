from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, func, Identity
from sqlalchemy.orm import relationship
from database.base import Base


class Loan(Base):
    __tablename__ = 'loans'

    loan_id = Column(Integer, Identity(), primary_key=True)
    customer_id = Column(Integer, ForeignKey('customers.customer_id'), nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    interest_rate = Column(Numeric(5, 2), nullable=False)
    term_months = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False, default='PENDING')
    approved_by = Column(Integer, ForeignKey('employees.employee_id'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship('Customer', back_populates='loans')
    approver = relationship('Employee')
