from pydantic import BaseModel
from datetime import date
from typing import Optional


class CardCreate(BaseModel):
    customer_id: Optional[int] = None
    account_id: int
    card_type: str = 'VIRTUAL'
    expiry_date: Optional[date] = None
    cvv: Optional[str] = None


class CardResponse(BaseModel):
    card_id: int
    customer_id: int
    account_id: int
    card_number: str
    card_type: str
    expiry_date: date
    status: str
    cvv: Optional[str] = None

    class Config:
        orm_mode = True
