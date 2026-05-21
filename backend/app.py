from fastapi import FastAPI
from database.base import Base
from database.connection import engine
from routes.auth import router as auth_router
from routes.customers import router as customer_router
from routes.accounts import router as account_router
from routes.transactions import router as transaction_router

app = FastAPI(title='Core Banking API', version='0.1.0')

Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix='/api/auth', tags=['auth'])
app.include_router(customer_router, prefix='/api/customers', tags=['customers'])
app.include_router(account_router, prefix='/api/accounts', tags=['accounts'])
app.include_router(transaction_router, prefix='/api/transactions', tags=['transactions'])


@app.get('/')
def root() -> dict:
    return {'message': 'Banking API Running'}


@app.get('/health')
def health() -> dict:
    return {'status': 'healthy'}
