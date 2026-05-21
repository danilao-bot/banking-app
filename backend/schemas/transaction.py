from pydantic import BaseModel
from typing import Optional


class TransactionCreate(BaseModel):
    account_id: int
    amount: float
    description: Optional[str] = None
    reference: Optional[str] = None


class TransferCreate(TransactionCreate):
    target_account_id: int


class TransactionResponse(BaseModel):
    transaction_id: int
    account_id: int
    transaction_type: str
    amount: float
    currency: str
    transaction_date: str
    description: Optional[str]
    reference: Optional[str]
    related_account_id: Optional[int]
    status: str

    class Config:
        orm_mode = True
