from pydantic import BaseModel
from typing import Optional


class EmployeeCreate(BaseModel):
    user_id: int
    branch_id: Optional[int] = None
    position: str


class EmployeeResponse(BaseModel):
    employee_id: int
    user_id: int
    branch_id: Optional[int]
    position: str

    class Config:
        orm_mode = True
