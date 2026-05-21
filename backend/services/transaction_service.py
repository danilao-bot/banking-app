from sqlalchemy.orm import Session
from models.account import Account
from models.transaction import Transaction
from sqlalchemy.exc import IntegrityError


class TransactionService:
    def __init__(self, db: Session):
        self.db = db

    def deposit(self, account_id: int, amount: float, description: str = None, reference: str = None):
        account = self.db.query(Account).filter(Account.account_id == account_id).first()
        if not account or account.status != 'ACTIVE':
            return None
        account.balance += amount
        transaction = Transaction(
            account_id=account.account_id,
            transaction_type='DEPOSIT',
            amount=amount,
            description=description,
            reference=reference,
            status='COMPLETED',
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def withdraw(self, account_id: int, amount: float, description: str = None, reference: str = None):
        account = self.db.query(Account).filter(Account.account_id == account_id).first()
        if not account or account.status != 'ACTIVE' or account.balance < amount:
            return None
        account.balance -= amount
        transaction = Transaction(
            account_id=account.account_id,
            transaction_type='WITHDRAWAL',
            amount=amount,
            description=description,
            reference=reference,
            status='COMPLETED',
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def transfer(self, source_account_id: int, target_account_id: int, amount: float, description: str = None, reference: str = None):
        source = self.db.query(Account).filter(Account.account_id == source_account_id).first()
        target = self.db.query(Account).filter(Account.account_id == target_account_id).first()
        if not source or not target or source.status != 'ACTIVE' or target.status != 'ACTIVE':
            return None
        if source.balance < amount:
            return None

        source.balance -= amount
        target.balance += amount

        transaction = Transaction(
            account_id=source.account_id,
            transaction_type='TRANSFER',
            amount=amount,
            description=description,
            reference=reference,
            related_account_id=target.account_id,
            status='COMPLETED',
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def get_history(self, account_id: int):
        return self.db.query(Transaction).filter(Transaction.account_id == account_id).order_by(Transaction.transaction_date.desc()).all()
