from pydantic import BaseModel
from typing import Optional


class LoanCreate(BaseModel):
    customer_id: int
    amount: float
    interest_rate: float
    term_months: int


class LoanResponse(BaseModel):
    loan_id: int
    customer_id: int
    amount: float
    interest_rate: float
    term_months: int
    status: str
    approved_by: Optional[int]

    class Config:
        orm_mode = True
