from sqlalchemy.orm import Session
from models.employee import Employee


class EmployeeService:
    def __init__(self, db: Session):
        self.db = db

    def create_employee(self, user_id: int, position: str, branch_id: int = None):
        employee = Employee(user_id=user_id, position=position.upper(), branch_id=branch_id)
        self.db.add(employee)
        self.db.commit()
        self.db.refresh(employee)
        return employee

    def list_employees(self):
        return self.db.query(Employee).all()

    def get_employee(self, employee_id: int):
        return self.db.query(Employee).filter(Employee.employee_id == employee_id).first()
