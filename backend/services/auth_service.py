from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models.user import User
from utils.security import hash_password, verify_password
from utils.jwt import create_access_token


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str):
        return self.db.query(User).filter(User.email == email).first()

    def register(self, email: str, password: str, role: str = 'CUSTOMER'):
        user = User(email=email, password_hash=hash_password(password), role=role)
        self.db.add(user)
        try:
            self.db.commit()
            self.db.refresh(user)
            return user
        except IntegrityError:
            self.db.rollback()
            return None

    def authenticate(self, email: str, password: str):
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def create_token(self, user):
        return create_access_token(subject=str(user.user_id), role=user.role)
