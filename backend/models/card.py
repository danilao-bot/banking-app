from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime, func
from sqlalchemy.orm import relationship
from database.base import Base


class Card(Base):
    __tablename__ = 'cards'

    card_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey('customers.customer_id'), nullable=False)
    account_id = Column(Integer, ForeignKey('accounts.account_id'), nullable=False)
    card_number = Column(String(20), unique=True, nullable=False)
    card_type = Column(String(50), nullable=False, default='DEBIT')
    expiry_date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False, default='ACTIVE')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship('Customer')
    account = relationship('Account')
