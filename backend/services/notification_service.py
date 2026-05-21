from sqlalchemy.orm import Session
from models.notification import Notification
from datetime import datetime


class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def create_notification(self, user_id: int, title: str, message: str):
        notification = Notification(user_id=user_id, title=title, message=message)
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def list_notifications(self, user_id: int):
        return self.db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

    def mark_read(self, notification_id: int):
        notification = self.db.query(Notification).filter(Notification.notification_id == notification_id).first()
        if not notification:
            return None
        notification.status = 'READ'
        notification.read_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(notification)
        return notification
