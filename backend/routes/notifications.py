from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.notification_service import NotificationService
from database.connection import get_db
from schemas.notification import NotificationCreate, NotificationResponse
from utils.auth import get_current_user, require_role

router = APIRouter()


@router.post('/', response_model=NotificationResponse)
def create_notification(payload: NotificationCreate, current_user=Depends(require_role('ADMIN', 'MANAGER')), db: Session = Depends(get_db)):
    service = NotificationService(db)
    notification = service.create_notification(payload.user_id, payload.title, payload.message)
    if not notification:
        raise HTTPException(status_code=400, detail='Unable to create notification')
    return notification


@router.get('/', response_model=list[NotificationResponse])
def list_notifications(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = NotificationService(db)
    return service.list_notifications(current_user.user_id)


@router.post('/{notification_id}/read', response_model=NotificationResponse)
def mark_read(notification_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = NotificationService(db)
    notification = service.mark_read(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail='Notification not found')
    return notification
