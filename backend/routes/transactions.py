from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.transaction_service import TransactionService
from services.account_service import AccountService
from database.connection import get_db
from schemas.transaction import TransactionCreate, TransferCreate, TransactionResponse
from utils.auth import get_current_user
from models.account import Account
from models.transaction import Transaction
from datetime import datetime
from collections import defaultdict

router = APIRouter()


@router.get('/me', response_model=list[TransactionResponse])
def my_transactions(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Return all transactions across all of the current user's accounts."""
    if not current_user.customer:
        return []
    account_ids = [a.account_id for a in current_user.customer.accounts]
    if not account_ids:
        return []
    return (
        db.query(Transaction)
        .filter(Transaction.account_id.in_(account_ids))
        .order_by(Transaction.transaction_date.desc())
        .all()
    )


@router.post('/send', response_model=TransactionResponse)
def send_money(
    payload: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Transfer money by account number — user-friendly endpoint for the frontend."""
    if not current_user.customer:
        raise HTTPException(status_code=400, detail='No customer profile found')

    to_account_number = payload.get('to_account_number')
    amount = payload.get('amount')
    description = payload.get('description', 'Transfer')

    if not to_account_number or not amount:
        raise HTTPException(status_code=422, detail='to_account_number and amount are required')

    # Resolve sender's first ACTIVE account
    sender_accounts = current_user.customer.accounts
    if not sender_accounts:
        raise HTTPException(status_code=400, detail='No accounts found for sender')
    source_account = next((a for a in sender_accounts if a.status == 'ACTIVE'), None)
    if not source_account:
        raise HTTPException(status_code=400, detail='No active account found')

    # Resolve recipient by account number
    target_account = db.query(Account).filter(Account.account_number == to_account_number).first()
    if not target_account:
        raise HTTPException(status_code=404, detail='Recipient account not found')

    service = TransactionService(db)
    txn = service.transfer(source_account.account_id, target_account.account_id, float(amount), description)
    if not txn:
        raise HTTPException(status_code=400, detail='Transfer failed. Check your balance and try again.')
        
    from services.audit_service import AuditService
    from services.notification_service import NotificationService
    
    AuditService(db).log(
        user_id=current_user.user_id,
        action='TRANSFER',
        entity='transaction',
        entity_id=txn.transaction_id,
        description=f"Transferred ₦{float(amount):.2f} to account {target_account.account_number} ({target_account.customer.first_name} {target_account.customer.last_name})"
    )
    
    NotificationService(db).create_notification(
        user_id=current_user.user_id,
        title='Transfer Sent',
        message=f"You have successfully transferred ₦{float(amount):.2f} to {target_account.customer.first_name} {target_account.customer.last_name} ({target_account.account_number})."
    )
    
    NotificationService(db).create_notification(
        user_id=target_account.customer.user_id,
        title='Transfer Received',
        message=f"Your account {target_account.account_number} has been credited with ₦{float(amount):.2f} from {current_user.customer.first_name} {current_user.customer.last_name}."
    )
    
    return txn


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
        
    from services.audit_service import AuditService
    from services.notification_service import NotificationService
    
    acc = db.query(Account).filter(Account.account_id == payload.account_id).first()
    notify_user_id = acc.customer.user_id if (acc and acc.customer) else current_user.user_id
    
    AuditService(db).log(
        user_id=current_user.user_id,
        action='DEPOSIT',
        entity='transaction',
        entity_id=transaction.transaction_id,
        description=f"Deposited ₦{payload.amount:.2f} into account {acc.account_number if acc else payload.account_id}"
    )
    
    NotificationService(db).create_notification(
        user_id=notify_user_id,
        title='Deposit Successful',
        message=f"Your account {acc.account_number if acc else ''} has been credited with ₦{payload.amount:.2f}."
    )
    
    return transaction


@router.post('/withdraw', response_model=TransactionResponse)
def withdraw(payload: TransactionCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    _verify_account_ownership(current_user, payload.account_id, db)
    service = TransactionService(db)
    transaction = service.withdraw(payload.account_id, payload.amount, payload.description, payload.reference)
    if not transaction:
        raise HTTPException(status_code=400, detail='Withdrawal failed. Check balance and ensure the amount is positive.')
        
    from services.audit_service import AuditService
    from services.notification_service import NotificationService
    
    acc = db.query(Account).filter(Account.account_id == payload.account_id).first()
    notify_user_id = acc.customer.user_id if (acc and acc.customer) else current_user.user_id
    
    AuditService(db).log(
        user_id=current_user.user_id,
        action='WITHDRAWAL',
        entity='transaction',
        entity_id=transaction.transaction_id,
        description=f"Withdrew ₦{payload.amount:.2f} from account {acc.account_number if acc else payload.account_id}"
    )
    
    NotificationService(db).create_notification(
        user_id=notify_user_id,
        title='Withdrawal Successful',
        message=f"Your account {acc.account_number if acc else ''} has been debited with ₦{payload.amount:.2f}."
    )
    
    return transaction


@router.post('/transfer', response_model=TransactionResponse)
def transfer(payload: TransferCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    _verify_account_ownership(current_user, payload.account_id, db)
    service = TransactionService(db)
    transaction = service.transfer(payload.account_id, payload.target_account_id, payload.amount, payload.description, payload.reference)
    if not transaction:
        raise HTTPException(status_code=400, detail='Transfer failed. Verify both accounts are active and you have sufficient funds.')
        
    from services.audit_service import AuditService
    from services.notification_service import NotificationService
    
    src_acc = db.query(Account).filter(Account.account_id == payload.account_id).first()
    tgt_acc = db.query(Account).filter(Account.account_id == payload.target_account_id).first()
    
    AuditService(db).log(
        user_id=current_user.user_id,
        action='TRANSFER',
        entity='transaction',
        entity_id=transaction.transaction_id,
        description=f"Transferred ₦{payload.amount:.2f} from account {src_acc.account_number if src_acc else payload.account_id} to account {tgt_acc.account_number if tgt_acc else payload.target_account_id}"
    )
    
    if src_acc and src_acc.customer:
        NotificationService(db).create_notification(
            user_id=src_acc.customer.user_id,
            title='Transfer Sent',
            message=f"You have successfully transferred ₦{payload.amount:.2f} to {tgt_acc.customer.first_name + ' ' + tgt_acc.customer.last_name if (tgt_acc and tgt_acc.customer) else 'account ' + str(payload.target_account_id)}."
        )
        
    if tgt_acc and tgt_acc.customer:
        NotificationService(db).create_notification(
            user_id=tgt_acc.customer.user_id,
            title='Transfer Received',
            message=f"Your account {tgt_acc.account_number} has been credited with ₦{payload.amount:.2f} from {src_acc.customer.first_name + ' ' + src_acc.customer.last_name if (src_acc and src_acc.customer) else 'account ' + str(payload.account_id)}."
        )
        
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


@router.get('/me/grouped', response_model=dict)
def my_transactions_grouped(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Return transactions grouped by month (YYYY-MM)"""
    if not current_user.customer:
        return {}
    
    account_ids = [a.account_id for a in current_user.customer.accounts]
    if not account_ids:
        return {}
    
    transactions = db.query(Transaction)\
        .filter(Transaction.account_id.in_(account_ids))\
        .order_by(Transaction.transaction_date.desc())\
        .all()
    
    grouped = defaultdict(list)
    for txn in transactions:
        month_key = txn.transaction_date.strftime('%Y-%m')
        month_label = txn.transaction_date.strftime('%B %Y')
        grouped[month_key] = {
            'month': month_label,
            'transactions': []
        }
    
    for txn in transactions:
        month_key = txn.transaction_date.strftime('%Y-%m')
        grouped[month_key]['transactions'].append({
            'transaction_id': txn.transaction_id,
            'account_id': txn.account_id,
            'transaction_type': txn.transaction_type,
            'amount': txn.amount,
            'currency': txn.currency,
            'transaction_date': txn.transaction_date,
            'description': txn.description,
            'reference': txn.reference,
            'related_account_id': txn.related_account_id,
            'status': txn.status,
        })
    
    return dict(sorted(grouped.items(), reverse=True))

