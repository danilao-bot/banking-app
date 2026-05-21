from sqlalchemy.orm import Session
from models.loan import Loan


class LoanService:
    def __init__(self, db: Session):
        self.db = db

    def request_loan(self, customer_id: int, amount: float, interest_rate: float, term_months: int):
        loan = Loan(
            customer_id=customer_id,
            amount=amount,
            interest_rate=interest_rate,
            term_months=term_months,
            status='PENDING',
        )
        self.db.add(loan)
        self.db.commit()
        self.db.refresh(loan)
        return loan

    def approve_loan(self, loan_id: int, approver_id: int):
        loan = self.db.query(Loan).filter(Loan.loan_id == loan_id).first()
        if not loan or loan.status != 'PENDING':
            return None
        loan.status = 'APPROVED'
        loan.approved_by = approver_id
        self.db.commit()
        self.db.refresh(loan)
        return loan

    def list_loans(self):
        return self.db.query(Loan).all()
