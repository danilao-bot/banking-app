import os
import sys
import tempfile
import pytest
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure project root is on sys.path so imports like `database.base` work
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from database.base import Base

# Create a temporary sqlite DB and set DATABASE_URL before importing the app
db_fd, db_path = tempfile.mkstemp(suffix='.db')
DB_URL = f"sqlite:///{db_path}"
os.environ['DATABASE_URL'] = DB_URL

# Create engine and ensure schema exists for tests
engine = create_engine(DB_URL, connect_args={'check_same_thread': False}, future=True)
Base.metadata.create_all(bind=engine)

@pytest.fixture(scope='session')
def test_db_engine():
    yield engine
    engine.dispose()
    try:
        os.close(db_fd)
        os.unlink(db_path)
    except Exception:
        pass

@pytest.fixture(scope='function')
def db_session(test_db_engine):
    Session = sessionmaker(bind=test_db_engine, autoflush=False, autocommit=False, future=True)
    session = Session()
    try:
        yield session
    finally:
        session.rollback()
        session.close()

from app import app
from fastapi.testclient import TestClient

@pytest.fixture(scope='session')
def client():
    return TestClient(app)
