from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.card_service import CardService
from database.connection import get_db
from schemas.card import CardCreate, CardResponse
from utils.auth import get_current_user, require_role
from datetime import date
from dateutil.relativedelta import relativedelta

router = APIRouter()


@router.post('/', response_model=CardResponse)
def issue_card(payload: CardCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = CardService(db)

    # For regular customers, enforce ownership
    customer_id = payload.customer_id
    account_id = payload.account_id
    if current_user.role not in ['ADMIN', 'MANAGER']:
        if not current_user.customer:
            raise HTTPException(status_code=400, detail='No customer profile found')
        customer_id = current_user.customer.customer_id
        # Verify the account belongs to the customer
        from services.account_service import AccountService
        acc_service = AccountService(db)
        account = acc_service.get_account(account_id)
        if not account or account.customer_id != customer_id:
            raise HTTPException(status_code=403, detail='Account does not belong to you')

    # Auto-generate expiry if not provided
    expiry = payload.expiry_date
    if not expiry:
        try:
            expiry = date.today() + relativedelta(years=4)
        except Exception:
            from datetime import timedelta
            expiry = date.today().replace(year=date.today().year + 4)

    card = service.issue_card(customer_id, account_id, payload.card_type, expiry)
    if not card:
        raise HTTPException(status_code=400, detail='Unable to issue card')
    return card


@router.get('/', response_model=list[CardResponse])
def list_all_cards(current_user=Depends(require_role('ADMIN', 'MANAGER')), db: Session = Depends(get_db)):
    service = CardService(db)
    return service.list_cards()


@router.get('/me', response_model=list[CardResponse])
def my_cards(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.customer:
        return []
    service = CardService(db)
    return service.get_customer_cards(current_user.customer.customer_id)
