from sqlalchemy.orm import Session
from models.account import Account
from utils.validators import validate_account_type
from sqlalchemy.exc import IntegrityError


class AccountService:
    def __init__(self, db: Session):
        self.db = db

    def generate_account_number(self, customer_id: int) -> str:
        # Generate 10-digit NUBAN style: "90" + 5 digits customer_id + 3 digits count/index
        count = self.db.query(Account).filter(Account.customer_id == customer_id).count() + 1
        return f"90{customer_id:05d}{count:03d}"

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

    def get_account_by_number(self, account_number: str):
        return self.db.query(Account).filter(Account.account_number == account_number).first()

    def get_customer_accounts(self, customer_id: int):
        return self.db.query(Account).filter(Account.customer_id == customer_id).all()

    def list_accounts(self):
        return self.db.query(Account).all()

    def get_balance(self, account_id: int):
        account = self.get_account(account_id)
        return float(account.balance) if account else None
