from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.employee_service import EmployeeService
from database.connection import get_db
from schemas.employee import EmployeeCreate, EmployeeResponse
from utils.auth import get_current_user, require_role

router = APIRouter()


@router.post('/', response_model=EmployeeResponse)
def create_employee(payload: EmployeeCreate, current_user=Depends(require_role('ADMIN', 'MANAGER')), db: Session = Depends(get_db)):
    service = EmployeeService(db)
    employee = service.create_employee(payload.user_id, payload.position, payload.branch_id)
    if not employee:
        raise HTTPException(status_code=400, detail='Unable to create employee')
    return employee


@router.get('/', response_model=list[EmployeeResponse])
def list_employees(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = EmployeeService(db)
    return service.list_employees()


@router.get('/{employee_id}', response_model=EmployeeResponse)
def get_employee(employee_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = EmployeeService(db)
    employee = service.get_employee(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail='Employee not found')
    return employee
