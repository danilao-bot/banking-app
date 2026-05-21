from sqlalchemy.orm import Session
from datetime import date
from models.card import Card


class CardService:
    def __init__(self, db: Session):
        self.db = db

    def issue_card(self, customer_id: int, account_id: int, card_type: str, expiry_date: date):
        card_number = self._generate_card_number(customer_id)
        card = Card(
            customer_id=customer_id,
            account_id=account_id,
            card_number=card_number,
            card_type=card_type.upper(),
            expiry_date=expiry_date,
            status='ACTIVE',
        )
        self.db.add(card)
        self.db.commit()
        self.db.refresh(card)
        return card

    def _generate_card_number(self, customer_id: int) -> str:
        count = self.db.query(Card).count() + 1
        return f"CARD{customer_id:06d}{count:04d}"

    def list_cards(self):
        return self.db.query(Card).all()
