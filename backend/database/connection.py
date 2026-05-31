from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from config import DATABASE_URL, ORACLE_USER, ORACLE_PASSWORD, ORACLE_DSN, ORACLE_WALLET_PATH

def create_resilient_engine():
    connect_args = {}
    engine_url = DATABASE_URL

    if not engine_url:
        if ORACLE_WALLET_PATH:
            connect_args['wallet_location'] = ORACLE_WALLET_PATH
        engine_url = f"oracle+oracledb://{ORACLE_USER}:{ORACLE_PASSWORD}@{ORACLE_DSN}"

    # SQLite requires check_same_thread=False when used in development with reload/threaded servers
    if engine_url.startswith('sqlite'):
        connect_args.setdefault('check_same_thread', False)
        print("DATABASE: Configured for SQLite. Connection established.")
        return create_engine(engine_url, connect_args=connect_args, future=True, echo=False)

    try:
        # Try to create engine and connect
        print("DATABASE: Attempting connection to Oracle Database...")
        test_engine = create_engine(engine_url, connect_args=connect_args, future=True, echo=False)
        # Try a quick test connection
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1 FROM DUAL"))
        print("DATABASE: Connected to Oracle Database successfully.")
        return test_engine
    except Exception as e:
        print(f"\nDATABASE WARNING: Connection to Oracle failed ({e})")
        print("DATABASE: Falling back to local SQLite database (sqlite:///./bank.db) for development.")
        sqlite_url = "sqlite:///./bank.db"
        sqlite_connect_args = {'check_same_thread': False}
        return create_engine(sqlite_url, connect_args=sqlite_connect_args, future=True, echo=False)

engine = create_resilient_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

