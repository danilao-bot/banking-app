from pathlib import Path
from dotenv import load_dotenv
import os

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR.parent / '.env')

ORACLE_USER = os.getenv('ORACLE_USER', 'admin')
ORACLE_PASSWORD = os.getenv('ORACLE_PASSWORD', 'password')
ORACLE_DSN = os.getenv('ORACLE_DSN', 'localhost/orclpdb1')
ORACLE_WALLET_PATH = os.getenv('ORACLE_WALLET_PATH', '')
SECRET_KEY = os.getenv('SECRET_KEY', 'change_this_secret')
ALGORITHM = os.getenv('ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '60'))
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
