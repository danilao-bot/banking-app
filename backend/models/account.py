from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime, func, CheckConstraint
from sqlalchemy.orm import relationship
from database.base import Base


class Account(Base):
    __tablename__ = 'accounts'

    account_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey('customers.customer_id'), nullable=False)
    account_type = Column(String(50), nullable=False)
    account_number = Column(String(20), unique=True, nullable=False)
    currency = Column(String(10), nullable=False, default='USD')
    balance = Column(Numeric(18, 2), nullable=False, default=0)
    status = Column(String(20), nullable=False, default='ACTIVE')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("account_type IN ('SAVINGS','CURRENT','FIXED')", name='chk_account_type'),
        CheckConstraint("status IN ('ACTIVE','SUSPENDED','CLOSED')", name='chk_account_status'),
    )

    customer = relationship('Customer', back_populates='accounts')
    transactions = relationship('Transaction', back_populates='account')
