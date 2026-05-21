from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from config import ORACLE_USER, ORACLE_PASSWORD, ORACLE_DSN, ORACLE_WALLET_PATH

connect_args = {}
if ORACLE_WALLET_PATH:
    connect_args['wallet_location'] = ORACLE_WALLET_PATH

DATABASE_URL = f"oracle+oracledb://{ORACLE_USER}:{ORACLE_PASSWORD}@{ORACLE_DSN}"
engine = create_engine(DATABASE_URL, connect_args=connect_args, future=True, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
