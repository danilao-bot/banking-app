from sqlalchemy.orm import Session
from models.account import Account
from utils.validators import validate_account_type
from sqlalchemy.exc import IntegrityError


class AccountService:
    def __init__(self, db: Session):
        self.db = db

    def generate_account_number(self, customer_id: int) -> str:
        return f"ACCT{customer_id:06d}{self.db.query(Account).count() + 1:04d}"

    def create_account(self, customer_id: int, account_type: str, currency: str = 'USD'):
        if not validate_account_type(account_type):
            raise ValueError('Invalid account type')

        account = Account(
            customer_id=customer_id,
            account_type=account_type.upper(),
            account_number=self.generate_account_number(customer_id),
            currency=currency.upper(),
        )
        self.db.add(account)
        try:
            self.db.commit()
            self.db.refresh(account)
            return account
        except IntegrityError:
            self.db.rollback()
            raise

    def get_account(self, account_id: int):
        return self.db.query(Account).filter(Account.account_id == account_id).first()

    def get_balance(self, account_id: int):
        account = self.get_account(account_id)
        return float(account.balance) if account else None
