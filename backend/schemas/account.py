from pydantic import BaseModel
from typing import Optional


class AccountCreate(BaseModel):
    customer_id: int
    account_type: str
    currency: Optional[str] = 'USD'


class AccountResponse(BaseModel):
    account_id: int
    customer_id: int
    account_type: str
    account_number: str
    currency: str
    balance: float
    status: str

    class Config:
        orm_mode = True
