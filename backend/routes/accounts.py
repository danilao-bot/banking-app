from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.account_service import AccountService
from database.connection import get_db
from schemas.account import AccountCreate, AccountResponse
from utils.auth import get_current_user

router = APIRouter()


@router.post('/', response_model=AccountResponse)
def create_account(payload: AccountCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = AccountService(db)
    customer_id = payload.customer_id
    if current_user.role not in ['ADMIN', 'MANAGER', 'EMPLOYEE'] or not customer_id:
        if not current_user.customer:
            raise HTTPException(status_code=400, detail='No customer profile found for user')
        customer_id = current_user.customer.customer_id
    try:
        account = service.create_account(customer_id, payload.account_type, payload.currency)
        return account
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail='Unable to create account')


@router.get('/', response_model=list[AccountResponse])
def list_accounts(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = AccountService(db)
    if current_user.role in ['ADMIN', 'MANAGER', 'EMPLOYEE']:
        return service.list_accounts()
    if not current_user.customer:
        return []
    return service.get_customer_accounts(current_user.customer.customer_id)


@router.get('/me', response_model=list[AccountResponse])
def get_my_accounts(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.customer:
        raise HTTPException(status_code=400, detail='No customer profile found')
    service = AccountService(db)
    return service.get_customer_accounts(current_user.customer.customer_id)


@router.get('/lookup')
def lookup_account(account_number: str = None, phone: str = None, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    from models.customer import Customer
    from models.account import Account
    
    if not account_number and not phone:
        raise HTTPException(status_code=400, detail='Provide account_number or phone')
        
    account = None
    if account_number:
        account = db.query(Account).filter(Account.account_number == account_number).first()
    elif phone:
        customer = db.query(Customer).filter(Customer.phone == phone).first()
        if customer:
            account = db.query(Account).filter(Account.customer_id == customer.customer_id).first()
            
    if not account:
        raise HTTPException(status_code=404, detail='Recipient account not found')
        
    customer = account.customer
    return {
        'account_id': account.account_id,
        'account_number': account.account_number,
        'owner_name': f"{customer.first_name} {customer.last_name}"
    }


@router.get('/{account_id}/balance')
def get_balance(account_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = AccountService(db)
    # Check ownership
    account = service.get_account(account_id)
    if not account:
        raise HTTPException(status_code=404, detail='Account not found')
    if current_user.role not in ['ADMIN', 'MANAGER', 'EMPLOYEE']:
        if not current_user.customer or account.customer_id != current_user.customer.customer_id:
            raise HTTPException(status_code=403, detail='Insufficient permissions to access this account')
            
    return {'account_id': account_id, 'balance': float(account.balance)}
