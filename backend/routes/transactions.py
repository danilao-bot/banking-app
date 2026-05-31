from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.transaction_service import TransactionService
from services.account_service import AccountService
from database.connection import get_db
from schemas.transaction import TransactionCreate, TransferCreate, TransactionResponse
from utils.auth import get_current_user

router = APIRouter()


def _verify_account_ownership(current_user, account_id: int, db: Session):
    """Ensure the logged-in customer owns the account. Staff roles bypass."""
    if current_user.role in ['ADMIN', 'MANAGER', 'EMPLOYEE']:
        return
    service = AccountService(db)
    account = service.get_account(account_id)
    if not account:
        raise HTTPException(status_code=404, detail='Account not found')
    if not current_user.customer or account.customer_id != current_user.customer.customer_id:
        raise HTTPException(status_code=403, detail='You do not own this account')


@router.post('/deposit', response_model=TransactionResponse)
def deposit(payload: TransactionCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    _verify_account_ownership(current_user, payload.account_id, db)
    service = TransactionService(db)
    transaction = service.deposit(payload.account_id, payload.amount, payload.description, payload.reference)
    if not transaction:
        raise HTTPException(status_code=400, detail='Deposit failed. Ensure the account exists and the amount is positive.')
    return transaction


@router.post('/withdraw', response_model=TransactionResponse)
def withdraw(payload: TransactionCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    _verify_account_ownership(current_user, payload.account_id, db)
    service = TransactionService(db)
    transaction = service.withdraw(payload.account_id, payload.amount, payload.description, payload.reference)
    if not transaction:
        raise HTTPException(status_code=400, detail='Withdrawal failed. Check balance and ensure the amount is positive.')
    return transaction


@router.post('/transfer', response_model=TransactionResponse)
def transfer(payload: TransferCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    _verify_account_ownership(current_user, payload.account_id, db)
    service = TransactionService(db)
    transaction = service.transfer(payload.account_id, payload.target_account_id, payload.amount, payload.description, payload.reference)
    if not transaction:
        raise HTTPException(status_code=400, detail='Transfer failed. Verify both accounts are active and you have sufficient funds.')
    return transaction


@router.get('/history/{account_id}', response_model=list[TransactionResponse])
def history(account_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    _verify_account_ownership(current_user, account_id, db)
    service = TransactionService(db)
    transactions = service.get_history(account_id)
    return transactions


@router.get('/{transaction_id}', response_model=TransactionResponse)
def get_transaction(transaction_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = TransactionService(db)
    transaction = service.get_transaction(transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail='Transaction not found')
    # Verify ownership of the transaction
    if current_user.role not in ['ADMIN', 'MANAGER', 'EMPLOYEE']:
        if not current_user.customer:
            raise HTTPException(status_code=403, detail='Insufficient permissions')
        customer_account_ids = [a.account_id for a in current_user.customer.accounts]
        if transaction.account_id not in customer_account_ids:
            raise HTTPException(status_code=403, detail='You do not have access to this transaction')
    return transaction
