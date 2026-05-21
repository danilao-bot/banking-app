from sqlalchemy.orm import Session
from models.customer import Customer


class CustomerService:
    def __init__(self, db: Session):
        self.db = db

    def create_customer(self, user_id: int, first_name: str, last_name: str, phone: str = None, address: str = None, date_of_birth = None):
        customer = Customer(
            user_id=user_id,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            address=address,
            date_of_birth=date_of_birth,
        )
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def fetch_customer(self, customer_id: int):
        return self.db.query(Customer).filter(Customer.customer_id == customer_id).first()

    def list_customers(self):
        return self.db.query(Customer).all()
