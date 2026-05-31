from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, func, Identity
from sqlalchemy.orm import relationship, backref
from database.base import Base


class Customer(Base):
    __tablename__ = 'customers'

    customer_id = Column(Integer, Identity(), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False, unique=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    address = Column(String(400))
    date_of_birth = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship('User', backref=backref('customer', uselist=False), uselist=False)
    accounts = relationship('Account', back_populates='customer')
    loans = relationship('Loan', back_populates='customer')
