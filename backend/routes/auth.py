from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from services.auth_service import AuthService
from services.customer_service import CustomerService
from database.connection import get_db
from utils.auth import get_current_user

router = APIRouter()


@router.post('/register', response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = auth_service.register(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')

    customer_service = CustomerService(db)
    customer = customer_service.create_customer(
        user_id=user.user_id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        gender=payload.gender,
    )

    from services.account_service import AccountService
    account_service = AccountService(db)
    account = account_service.create_account(
        customer_id=customer.customer_id,
        account_type='SAVINGS',
        currency='NGN'
    )

    from services.transaction_service import TransactionService
    transaction_service = TransactionService(db)
    transaction_service.deposit(
        account_id=account.account_id,
        amount=500000.00,
        description='LUCE Welcome Signup Reward',
        reference='REF-SIGNUP-500K'
    )

    # Log action & generate notification
    from services.audit_service import AuditService
    from services.notification_service import NotificationService
    
    AuditService(db).log(
        user_id=user.user_id,
        action='REGISTER',
        entity='user',
        entity_id=user.user_id,
        description=f'User registered successfully with email {payload.email}'
    )
    
    NotificationService(db).create_notification(
        user_id=user.user_id,
        title='Welcome to LUCE Bank!',
        message=f'Hello {payload.first_name}, your savings wallet has been funded with a welcome signup reward of ₦500,000.00.'
    )

    token = auth_service.create_token(user)
    return TokenResponse(access_token=token, role=user.role)


@router.post('/login', response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = auth_service.authenticate(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')
    
    # Log login event
    from services.audit_service import AuditService
    from services.notification_service import NotificationService
    
    AuditService(db).log(
        user_id=user.user_id,
        action='LOGIN',
        entity='user',
        entity_id=user.user_id,
        description=f'User logged in successfully'
    )
    
    NotificationService(db).create_notification(
        user_id=user.user_id,
        title='Successful Login',
        message='A new login was recorded for your account.'
    )
    
    token = auth_service.create_token(user)
    return TokenResponse(access_token=token, role=user.role)


@router.get('/me')
def get_me(current_user=Depends(get_current_user)):
    """Return the currently authenticated user's profile and linked customer details."""
    profile = {
        'user_id': current_user.user_id,
        'email': current_user.email,
        'role': current_user.role,
        'created_at': str(current_user.created_at),
    }
    if current_user.customer:
        c = current_user.customer
        profile['customer'] = {
            'customer_id': c.customer_id,
            'first_name': c.first_name,
            'last_name': c.last_name,
            'phone': c.phone,
            'address': c.address,
        }
    return profile
