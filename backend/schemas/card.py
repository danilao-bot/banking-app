from pydantic import BaseModel
from datetime import date


class CardCreate(BaseModel):
    customer_id: int
    account_id: int
    card_type: str
    expiry_date: date


class CardResponse(BaseModel):
    card_id: int
    customer_id: int
    account_id: int
    card_number: str
    card_type: str
    expiry_date: date
    status: str

    class Config:
        orm_mode = True
