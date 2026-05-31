from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, func, CheckConstraint, Identity
from sqlalchemy.orm import relationship
from database.base import Base


class Transaction(Base):
    __tablename__ = 'transactions'

    transaction_id = Column(Integer, Identity(), primary_key=True)
    account_id = Column(Integer, ForeignKey('accounts.account_id'), nullable=False)
    transaction_type = Column(String(50), nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(String(10), nullable=False, default='USD')
    transaction_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    description = Column(String(500))
    reference = Column(String(100))
    related_account_id = Column(Integer, ForeignKey('accounts.account_id'))
    status = Column(String(20), nullable=False, default='COMPLETED')

    __table_args__ = (
        CheckConstraint("transaction_type IN ('DEPOSIT','WITHDRAWAL','TRANSFER')", name='chk_transaction_type'),
        CheckConstraint('amount > 0', name='chk_transaction_amount_positive'),
        CheckConstraint("status IN ('PENDING','COMPLETED','FAILED')", name='chk_transaction_status'),
    )

    account = relationship('Account', back_populates='transactions', foreign_keys=[account_id])
    related_account = relationship('Account', foreign_keys=[related_account_id])
