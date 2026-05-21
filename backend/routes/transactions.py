from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.transaction_service import TransactionService
from database.connection import get_db
from schemas.transaction import TransactionCreate, TransferCreate, TransactionResponse
from utils.auth import get_current_user

router = APIRouter()


@router.post('/deposit', response_model=TransactionResponse)
def deposit(payload: TransactionCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = TransactionService(db)
    transaction = service.deposit(payload.account_id, payload.amount, payload.description, payload.reference)
    if not transaction:
        raise HTTPException(status_code=400, detail='Deposit failed')
    return transaction


@router.post('/withdraw', response_model=TransactionResponse)
def withdraw(payload: TransactionCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = TransactionService(db)
    transaction = service.withdraw(payload.account_id, payload.amount, payload.description, payload.reference)
    if not transaction:
        raise HTTPException(status_code=400, detail='Withdrawal failed')
    return transaction


@router.post('/transfer', response_model=TransactionResponse)
def transfer(payload: TransferCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = TransactionService(db)
    transaction = service.transfer(payload.account_id, payload.target_account_id, payload.amount, payload.description, payload.reference)
    if not transaction:
        raise HTTPException(status_code=400, detail='Transfer failed')
    return transaction


@router.get('/history/{account_id}', response_model=list[TransactionResponse])
def history(account_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = TransactionService(db)
    transactions = service.get_history(account_id)
    return transactions


@router.get('/{transaction_id}', response_model=TransactionResponse)
def get_transaction(transaction_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = TransactionService(db)
    transaction = service.get_transaction(transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail='Transaction not found')
    return transaction
