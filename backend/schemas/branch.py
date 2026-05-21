from pydantic import BaseModel
from typing import Optional


class BranchCreate(BaseModel):
    name: str
    address: str
    city: str
    state: Optional[str] = None
    phone: Optional[str] = None


class BranchResponse(BaseModel):
    branch_id: int
    name: str
    address: str
    city: str
    state: Optional[str]
    phone: Optional[str]

    class Config:
        orm_mode = True
