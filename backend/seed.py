import os
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

# Add project root to path
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from database.base import Base
from database.connection import engine, SessionLocal
from utils.security import hash_password

# Import all models to ensure they register on Base metadata
from models.user import User
from models.customer import Customer
from models.account import Account
from models.transaction import Transaction
from models.card import Card
from models.loan import Loan
from models.employee import Employee
from models.branch import Branch
from models.audit_log import AuditLog
from models.notification import Notification


def seed_database():
    print("SEEDB: Wiping local SQLite database tables...")
    # Drop all and recreate schemas
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("SEEDB: Schema reconstructed successfully.")

    db = SessionLocal()
    try:
        # 1. Create Customer 1 User Profile
        user1 = User(
            email="user@example.com",
            password_hash=hash_password("password"),
            role="CUSTOMER"
        )
        db.add(user1)
        db.flush()

        customer1 = Customer(
            user_id=user1.user_id,
            first_name="Ada",
            last_name="Okonkwo",
            phone="08012345678",
            address="12 Palm Avenue, Victoria Island, Lagos",
            date_of_birth=date(1995, 8, 15)
        )
        db.add(customer1)
        db.flush()

        # Create SAVINGS & CURRENT accounts for Customer 1
        account1_savings = Account(
            customer_id=customer1.customer_id,
            account_type="SAVINGS",
            account_number="9000001001",
            currency="NGN",
            balance=150000.00,
            status="ACTIVE"
        )
        account1_current = Account(
            customer_id=customer1.customer_id,
            account_type="CURRENT",
            account_number="9000001002",
            currency="NGN",
            balance=500000.00,
            status="ACTIVE"
        )
        db.add_all([account1_savings, account1_current])
        db.flush()

        # 2. Create Customer 2 (Friend) User Profile
        user2 = User(
            email="friend@example.com",
            password_hash=hash_password("password"),
            role="CUSTOMER"
        )
        db.add(user2)
        db.flush()

        customer2 = Customer(
            user_id=user2.user_id,
            first_name="Tunde",
            last_name="Bakare",
            phone="08087654321",
            address="45 Kuda Bypass, Wuse II, Abuja",
            date_of_birth=date(1992, 4, 20)
        )
        db.add(customer2)
        db.flush()

        # Create SAVINGS account for Customer 2
        account2_savings = Account(
            customer_id=customer2.customer_id,
            account_type="SAVINGS",
            account_number="9000002001",
            currency="NGN",
            balance=20000.00,
            status="ACTIVE"
        )
        db.add(account2_savings)
        db.flush()

        # 3. Create Co-branded Virtual Cards for Customer 1
        card1 = Card(
            customer_id=customer1.customer_id,
            account_id=account1_savings.account_id,
            card_number="5061880000011002",
            card_type="VIRTUAL",
            expiry_date=date.today() + timedelta(days=365*4),
            status="ACTIVE",
            cvv="743"
        )
        db.add(card1)

        # 4. Create Loan Request for Customer 1
        loan1 = Loan(
            customer_id=customer1.customer_id,
            amount=250000.00,
            interest_rate=8.00,
            term_months=6,
            status="PENDING"
        )
        db.add(loan1)

        # 5. Create Transaction History for Customer 1
        # Initial Funding Deposit
        tx1 = Transaction(
            account_id=account1_savings.account_id,
            transaction_type="DEPOSIT",
            amount=200000.00,
            description="Initial cash wallet funding",
            reference="REF-INIT-001",
            status="COMPLETED",
            transaction_date=datetime.now() - timedelta(days=5)
        )
        # Utility Withdrawal
        tx2 = Transaction(
            account_id=account1_savings.account_id,
            transaction_type="WITHDRAWAL",
            amount=30000.00,
            description="ATM cash withdrawal",
            reference="REF-ATM-993",
            status="COMPLETED",
            transaction_date=datetime.now() - timedelta(days=3)
        )
        # Outbound transfer to Customer 2 (Friend)
        tx3_out = Transaction(
            account_id=account1_savings.account_id,
            transaction_type="TRANSFER",
            amount=20000.00,
            description="Sent money to Tunde Bakare",
            reference="REF-XFER-002",
            related_account_id=account2_savings.account_id,
            status="COMPLETED",
            transaction_date=datetime.now() - timedelta(days=1)
        )
        tx3_in = Transaction(
            account_id=account2_savings.account_id,
            transaction_type="TRANSFER",
            amount=20000.00,
            description="Received transfer from account 9000001001",
            reference="REF-XFER-002",
            related_account_id=account1_savings.account_id,
            status="COMPLETED",
            transaction_date=datetime.now() - timedelta(days=1)
        )
        db.add_all([tx1, tx2, tx3_out, tx3_in])

        db.commit()
        print("SEEDB: Seed data populated successfully!")
        print(" -> Customer 1: user@example.com (password: password)")
        print("    Accounts: SAVINGS (9000001001), CURRENT (9000001002)")
        print(" -> Customer 2: friend@example.com (password: password)")
        print("    Accounts: SAVINGS (9000002001)")
    except Exception as e:
        db.rollback()
        print(f"SEEDB ERROR: Seeding process failed ({e})")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
