from pydantic import BaseModel
from typing import Optional
from datetime import date


class CustomerCreate(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None


class CustomerResponse(BaseModel):
    customer_id: int
    user_id: int
    first_name: str
    last_name: str
    phone: Optional[str]
    address: Optional[str]
    date_of_birth: Optional[date]

    class Config:
        orm_mode = True
