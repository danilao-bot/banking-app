from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.card_service import CardService
from database.connection import get_db
from schemas.card import CardCreate, CardResponse
from utils.auth import get_current_user, require_role

router = APIRouter()


@router.post('/', response_model=CardResponse)
def issue_card(payload: CardCreate, current_user=Depends(require_role('ADMIN', 'MANAGER')), db: Session = Depends(get_db)):
    service = CardService(db)
    card = service.issue_card(payload.customer_id, payload.account_id, payload.card_type, payload.expiry_date)
    if not card:
        raise HTTPException(status_code=400, detail='Unable to issue card')
    return card


@router.get('/', response_model=list[CardResponse])
def list_cards(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = CardService(db)
    return service.list_cards()
