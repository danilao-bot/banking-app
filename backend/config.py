from pathlib import Path
from dotenv import load_dotenv
import os

BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / '.env'
if not env_path.exists():
    env_path = BASE_DIR.parent / '.env'
load_dotenv(env_path)

DATABASE_URL = os.getenv('DATABASE_URL', '').strip()
ORACLE_USER = os.getenv('ORACLE_USER', 'admin')
ORACLE_PASSWORD = os.getenv('ORACLE_PASSWORD', 'password')
ORACLE_DSN = os.getenv('ORACLE_DSN', 'localhost/orclpdb1')
ORACLE_WALLET_PATH = os.getenv('ORACLE_WALLET_PATH', '')
SECRET_KEY = os.getenv('SECRET_KEY', 'change_this_secret')
ALGORITHM = os.getenv('ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '60'))
_cors_default = 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001'
CORS_ORIGINS = os.getenv('CORS_ORIGINS', _cors_default).split(',')

if not DATABASE_URL and (not ORACLE_DSN or ORACLE_DSN.startswith('your_')):
    DATABASE_URL = os.getenv('SQLITE_DATABASE_URL', 'sqlite:///./bank.db')
