from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.account_service import AccountService
from database.connection import get_db
from schemas.account import AccountCreate, AccountResponse

router = APIRouter()


@router.post('/', response_model=AccountResponse)
def create_account(payload: AccountCreate, db: Session = Depends(get_db)):
    service = AccountService(db)
    try:
        account = service.create_account(payload.customer_id, payload.account_type, payload.currency)
        return account
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail='Unable to create account')


@router.get('/{account_id}/balance')
def get_balance(account_id: int, db: Session = Depends(get_db)):
    service = AccountService(db)
    balance = service.get_balance(account_id)
    if balance is None:
        raise HTTPException(status_code=404, detail='Account not found')
    return {'account_id': account_id, 'balance': balance}
