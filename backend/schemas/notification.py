from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str


class NotificationResponse(BaseModel):
    notification_id: int
    user_id: int
    title: str
    message: str
    status: str
    created_at: datetime
    read_at: Optional[datetime]

    class Config:
        orm_mode = True
