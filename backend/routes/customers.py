from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.customer_service import CustomerService
from database.connection import get_db
from schemas.customer import CustomerResponse, CustomerCreate
from utils.auth import get_current_user

router = APIRouter()


@router.post('/', response_model=CustomerResponse)
def create_customer(payload: CustomerCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = CustomerService(db)
    customer = service.create_customer(
        user_id=current_user.user_id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
        address=payload.address,
        date_of_birth=payload.date_of_birth,
    )
    if not customer:
        raise HTTPException(status_code=400, detail='Unable to create customer')
    return customer


@router.get('/', response_model=list[CustomerResponse])
def list_customers(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = CustomerService(db)
    return service.list_customers()


@router.get('/{customer_id}', response_model=CustomerResponse)
def get_customer(customer_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = CustomerService(db)
    customer = service.fetch_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail='Customer not found')
    return customer
