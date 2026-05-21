from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.customer_service import CustomerService
from database.connection import get_db
from schemas.customer import CustomerResponse

router = APIRouter()


@router.get('/{customer_id}', response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    service = CustomerService(db)
    customer = service.fetch_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail='Customer not found')
    return customer
