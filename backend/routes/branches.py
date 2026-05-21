from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.branch_service import BranchService
from database.connection import get_db
from schemas.branch import BranchCreate, BranchResponse
from utils.auth import get_current_user, require_role

router = APIRouter()


@router.post('/', response_model=BranchResponse)
def create_branch(payload: BranchCreate, current_user=Depends(require_role('ADMIN', 'MANAGER')), db: Session = Depends(get_db)):
    service = BranchService(db)
    return service.create_branch(payload.name, payload.address, payload.city, payload.state, payload.phone)


@router.get('/', response_model=list[BranchResponse])
def list_branches(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = BranchService(db)
    return service.list_branches()


@router.get('/{branch_id}', response_model=BranchResponse)
def get_branch(branch_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = BranchService(db)
    branch = service.get_branch(branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail='Branch not found')
    return branch
