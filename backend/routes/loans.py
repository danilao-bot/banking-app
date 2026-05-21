from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.loan_service import LoanService
from database.connection import get_db
from schemas.loan import LoanCreate, LoanResponse
from utils.auth import get_current_user, require_role

router = APIRouter()


@router.post('/', response_model=LoanResponse)
def request_loan(payload: LoanCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = LoanService(db)
    loan = service.request_loan(payload.customer_id, payload.amount, payload.interest_rate, payload.term_months)
    if not loan:
        raise HTTPException(status_code=400, detail='Unable to request loan')
    return loan


@router.get('/', response_model=list[LoanResponse])
def list_loans(current_user=Depends(require_role('ADMIN', 'MANAGER')), db: Session = Depends(get_db)):
    service = LoanService(db)
    return service.list_loans()


@router.post('/{loan_id}/approve', response_model=LoanResponse)
def approve_loan(loan_id: int, current_user=Depends(require_role('ADMIN', 'MANAGER')), db: Session = Depends(get_db)):
    service = LoanService(db)
    loan = service.approve_loan(loan_id, current_user.employee.employee_id if hasattr(current_user, 'employee') else None)
    if not loan:
        raise HTTPException(status_code=400, detail='Unable to approve loan')
    return loan
