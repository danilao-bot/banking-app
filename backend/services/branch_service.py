from sqlalchemy.orm import Session
from models.branch import Branch


class BranchService:
    def __init__(self, db: Session):
        self.db = db

    def create_branch(self, name: str, address: str, city: str, state: str = None, phone: str = None):
        branch = Branch(name=name, address=address, city=city, state=state, phone=phone)
        self.db.add(branch)
        self.db.commit()
        self.db.refresh(branch)
        return branch

    def list_branches(self):
        return self.db.query(Branch).all()

    def get_branch(self, branch_id: int):
        return self.db.query(Branch).filter(Branch.branch_id == branch_id).first()
