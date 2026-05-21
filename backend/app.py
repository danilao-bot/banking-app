from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.base import Base
from database.connection import engine
from config import CORS_ORIGINS
from routes.auth import router as auth_router
from routes.customers import router as customer_router
from routes.accounts import router as account_router
from routes.transactions import router as transaction_router
from routes.branches import router as branch_router
from routes.employees import router as employee_router
from routes.loans import router as loan_router
from routes.cards import router as card_router
from routes.audit import router as audit_router
from routes.notifications import router as notification_router

app = FastAPI(title='Core Banking API', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allow_headers=['*'],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix='/api/auth', tags=['auth'])
app.include_router(customer_router, prefix='/api/customers', tags=['customers'])
app.include_router(account_router, prefix='/api/accounts', tags=['accounts'])
app.include_router(transaction_router, prefix='/api/transactions', tags=['transactions'])
app.include_router(branch_router, prefix='/api/branches', tags=['branches'])
app.include_router(employee_router, prefix='/api/employees', tags=['employees'])
app.include_router(loan_router, prefix='/api/loans', tags=['loans'])
app.include_router(card_router, prefix='/api/cards', tags=['cards'])
app.include_router(audit_router, prefix='/api/audit', tags=['audit'])
app.include_router(notification_router, prefix='/api/notifications', tags=['notifications'])


@app.get('/')
def root() -> dict:
    return {'message': 'Banking API Running'}


@app.get('/health')
def health() -> dict:
    return {'status': 'healthy'}
