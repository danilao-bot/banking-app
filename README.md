# Core Banking Management System

## Phase 1 — Requirements Confirmation and MVP Scope

### Project goal
Build a cloud-based Core Banking Management System using:
- Frontend: Next.js
- Backend: FastAPI (Python)
- Database: Oracle Autonomous Database
- ORM/DB Layer: SQLAlchemy / python-oracledb
- Architecture: Object-Oriented Programming
- Deployment: Vercel + Render

### Phase 1 objective
Confirm the Minimum Viable Product (MVP) and scope the first build so we can start with a clear, realistic student project.

---

## MVP Summary
The first deliverable will focus on the core banking workflow required for a functional banking application.

### Included in MVP now
1. Authentication
   - register
   - login
   - role-based session/token handling
2. Customer module
   - create customer
   - update customer
   - fetch customer data
3. Account module
   - create account
   - view balance
4. Transaction module
   - deposit
   - withdraw
   - transfer
   - transaction history

### Deferred to later phases
These are important for a complete system but not required for the first build:
- Loan management
- Card management
- Branch management
- Employee/admin/manager management
- Audit logging
- Notifications
- Reports and advanced dashboards
- PWA support

---

## Confirmed user roles
The system will support these roles:

- `User` (base class)
- `Customer`
- `Employee`
- `Admin`
- `Manager`

### Role responsibilities
- `Customer`: perform banking operations through the app, view accounts, and access transaction history.
- `Employee`: support customer account actions and banking operations.
- `Manager`: approve higher-level actions and review reports (future phase).
- `Admin`: manage users, roles, and system settings (future phase).

---

## Core modules for Phase 1

1. `auth`
   - JWT authentication
   - registration endpoint
   - login endpoint
   - role-based access control
2. `customer`
   - customer model
   - service for customer creation and updates
   - routes to fetch customer records
3. `account`
   - account model
   - service for account creation and balance inquiry
4. `transaction`
   - transaction model
   - deposit service
   - withdrawal service
   - transfer service
   - transaction history endpoint
5. `database`
   - Oracle connection
   - SQLAlchemy base setup
6. `utils`
   - shared utilities, hashing, JWT helpers, validation support

---

## OOP mapping for Phase 1
The system will use classes heavily to separate responsibilities.

### Example class roles
- `User`: base object for authentication, common fields, and shared methods.
- `Customer`: extends `User` with customer-specific profile details.
- `Account`: models bank accounts and balance operations.
- `Transaction`: records deposits, withdrawals, and transfers.
- `TransferService`: performs transfer business logic and account validation.
- `AuditLogger`: placeholder for future logging behavior.
- `Notification`: placeholder for optional notification actions.

### How classes map to backend architecture
- `models/`: table definitions and ORM classes
- `services/`: classes containing business logic and transaction handling
- `routes/`: FastAPI endpoint definitions calling service methods
- `database/`: connection setup and base metadata
- `utils/`: authentication helpers and reusable utilities

---

## Project structure preview
Inside `backend/` we will build:

```
backend/
 ├── models/
 ├── services/
 ├── routes/
 ├── database/
 └── utils/
```

And inside the frontend app:

```
frontend/
 ├── app/
 ├── components/
 ├── lib/
 ├── pages/
 └── styles/
```

---

## Current implementation status

### What is implemented now
- Backend FastAPI service with auth, customer, account, and transaction routes.
- Core transaction flows for deposit, withdrawal, transfer, and transaction history.
- Transfer flow now includes a confirmation screen and dedicated receipt page.
- Transaction detail page available for audit-style lookup.
- Frontend Next.js app with login, dashboard, customer management, account management, and transaction workflows.

### GitHub readiness notes
- Keep `.env` out of version control. Use `.env.example` as the template for environment configuration.
- Do not commit `frontend/node_modules/`, `frontend/.next/`, or other generated build artifacts.
- `backend/venv/`, `__pycache__/`, and other runtime files are ignored by `.gitignore`.
- The repository should include source files only, not local secrets or environment files.

### Local setup
1. Copy environment variables:
   - `cp .env.example .env`
2. Configure Oracle credentials in `.env` or use a local Oracle instance.
3. Start the backend:
   - `cd backend`
   - `uvicorn app:app --reload`
4. Start the frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

### Oracle database note
- Oracle Cloud may require billing setup even for the free tier.
- If you are not ready to use Oracle Cloud, prepare a local Oracle environment or compatible development database.
- Keep Oracle credentials private and do not commit them.

---

## Phase 2 — System Architecture

### Goal of this phase
Define the technical architecture for the banking platform and show how the frontend, backend, and Oracle database connect.

### Architecture overview
The application is split into three layers:

1. Frontend: Next.js React application
   - UI pages
   - API calls to backend
   - authentication flows and forms
2. Backend API: FastAPI service
   - business logic in service classes
   - ORM models for Oracle tables
   - REST routes for auth, customers, accounts, and transactions
3. Database: Oracle Autonomous Database
   - secure cloud storage for users, accounts, and transactions
   - connected via SQLAlchemy and python-oracledb

### Data flow

Frontend → Backend → Oracle Database

- The frontend sends JSON requests to FastAPI endpoints.
- FastAPI uses services to validate input, apply business rules, and call ORM models.
- SQLAlchemy generates SQL using `python-oracledb` for Oracle.
- The database returns results, which FastAPI shapes and sends back to the frontend.

### Folder structure for the backend

The backend will use a clear OOP folder layout:

```
backend/
 ├── app.py                # FastAPI application starter
 ├── database/
 │    ├── connection.py    # Oracle connection and session maker
 │    └── base.py          # SQLAlchemy declarative base
 ├── models/
 │    ├── user.py
 │    ├── customer.py
 │    ├── account.py
 │    └── transaction.py
 ├── services/
 │    ├── auth_service.py
 │    ├── customer_service.py
 │    ├── account_service.py
 │    └── transaction_service.py
 ├── routes/
 │    ├── auth.py
 │    ├── customers.py
 │    ├── accounts.py
 │    └── transactions.py
 ├── schemas/
 │    ├── auth.py
 │    ├── customer.py
 │    ├── account.py
 │    └── transaction.py
 ├── utils/
 │    ├── security.py
 │    ├── jwt.py
 │    └── validators.py
 └── config.py            # environment and settings loader
```

### Folder structure for the frontend

The frontend will be a Next.js app with reusable components:

```
frontend/
 ├── app/
 │    ├── layout.tsx
 │    ├── page.tsx
 │    ├── login/page.tsx
 │    ├── dashboard/page.tsx
 │    ├── customers/page.tsx
 │    └── accounts/page.tsx
 ├── components/
 │    ├── Header.tsx
 │    ├── Sidebar.tsx
 │    ├── CustomerForm.tsx
 │    └── AccountCard.tsx
 ├── lib/
 │    ├── api.ts
 │    └── auth.ts
 ├── styles/
 │    ├── globals.css
 │    └── components.css
 └── public/
```

### API connectivity
Use REST endpoints in FastAPI, for example:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/customers/{customer_id}`
- `POST /api/accounts`
- `POST /api/transactions/deposit`
- `POST /api/transactions/withdraw`
- `POST /api/transactions/transfer`

### Oracle connection pattern

Backend will connect to Oracle using:
- `python-oracledb` as the driver
- SQLAlchemy ORM with Oracle dialect
- environment variables for credentials
- connection string from Oracle Cloud wallet or easy connect string

The backend connection layer will be responsible for:
- creating the SQLAlchemy engine
- creating session objects
- handling database transactions safely
- retrying or raising on connection errors

---

## When does actual building start?
The first four phases are design and planning so the code is stable and matched to the project goals.

- Phase 1: MVP scope and requirements
- Phase 2: System architecture and structure
- Phase 3: Database design
- Phase 4: OOP design and class mapping

The actual project build starts in Phase 5 with the frontend/backend project setup and initial code skeleton. Until then, we are defining a strong foundation.

---

## Phase 3 — Database Design

### Goal of this phase
Design the Oracle database tables, constraints, and relationships for the core banking MVP.

### Oracle tables for Phase 1
We will create tables for users, customers, accounts, and transactions.

#### 1. `users`
Stores authentication identities and roles.
- `user_id` NUMBER PRIMARY KEY
- `email` VARCHAR2(255) UNIQUE NOT NULL
- `password_hash` VARCHAR2(512) NOT NULL
- `role` VARCHAR2(50) NOT NULL
- `created_at` TIMESTAMP DEFAULT SYSTIMESTAMP
- `updated_at` TIMESTAMP

#### 2. `customers`
Stores customer profiles and links to `users`.
- `customer_id` NUMBER PRIMARY KEY
- `user_id` NUMBER NOT NULL REFERENCES users(user_id)
- `first_name` VARCHAR2(100) NOT NULL
- `last_name` VARCHAR2(100) NOT NULL
- `phone` VARCHAR2(20)
- `address` VARCHAR2(400)
- `date_of_birth` DATE
- `created_at` TIMESTAMP DEFAULT SYSTIMESTAMP
- `updated_at` TIMESTAMP

#### 3. `accounts`
Represents bank accounts held by customers.
- `account_id` NUMBER PRIMARY KEY
- `customer_id` NUMBER NOT NULL REFERENCES customers(customer_id)
- `account_type` VARCHAR2(50) NOT NULL CHECK (account_type IN ('SAVINGS','CURRENT','FIXED'))
- `account_number` VARCHAR2(20) UNIQUE NOT NULL
- `currency` VARCHAR2(10) DEFAULT 'USD' NOT NULL
- `balance` NUMBER(18,2) DEFAULT 0 NOT NULL
- `status` VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE','SUSPENDED','CLOSED'))
- `created_at` TIMESTAMP DEFAULT SYSTIMESTAMP
- `updated_at` TIMESTAMP

#### 4. `transactions`
Records deposit, withdrawal, and transfer activities.
- `transaction_id` NUMBER PRIMARY KEY
- `account_id` NUMBER NOT NULL REFERENCES accounts(account_id)
- `transaction_type` VARCHAR2(50) NOT NULL CHECK (transaction_type IN ('DEPOSIT','WITHDRAWAL','TRANSFER'))
- `amount` NUMBER(18,2) NOT NULL CHECK (amount > 0)
- `currency` VARCHAR2(10) DEFAULT 'USD' NOT NULL
- `transaction_date` TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
- `description` VARCHAR2(500)
- `reference` VARCHAR2(100)
- `related_account_id` NUMBER NULL -- for transfers
- `status` VARCHAR2(20) DEFAULT 'COMPLETED' NOT NULL CHECK (status IN ('PENDING','COMPLETED','FAILED'))

### Relationships
- `users` 1-to-1 → `customers`
- `customers` 1-to-many → `accounts`
- `accounts` 1-to-many → `transactions`
- `transactions` may reference another account using `related_account_id` for transfers

### Sample ERD description
- `users` connects to `customers` with `user_id`
- `customers` connects to `accounts` with `customer_id`
- `accounts` connects to `transactions` with `account_id`
- For transfers, `transactions.related_account_id` points to `accounts.account_id`

### Sample data to seed
- `users`: admin@example.com, customer1@example.com
- `customers`: a signal customer profile for `customer1@example.com`
- `accounts`: one SAVINGS account with `balance=1000.00`
- `transactions`: a sample deposit record and a transfer record

### Oracle-friendly SQL example

```sql
CREATE TABLE users (
  user_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  email VARCHAR2(255) UNIQUE NOT NULL,
  password_hash VARCHAR2(512) NOT NULL,
  role VARCHAR2(50) NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE customers (
  customer_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id NUMBER NOT NULL,
  first_name VARCHAR2(100) NOT NULL,
  last_name VARCHAR2(100) NOT NULL,
  phone VARCHAR2(20),
  address VARCHAR2(400),
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  updated_at TIMESTAMP,
  CONSTRAINT fk_customer_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE accounts (
  account_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  customer_id NUMBER NOT NULL,
  account_type VARCHAR2(50) NOT NULL CHECK (account_type IN ('SAVINGS','CURRENT','FIXED')),
  account_number VARCHAR2(20) UNIQUE NOT NULL,
  currency VARCHAR2(10) DEFAULT 'USD' NOT NULL,
  balance NUMBER(18,2) DEFAULT 0 NOT NULL,
  status VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE','SUSPENDED','CLOSED')),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  updated_at TIMESTAMP,
  CONSTRAINT fk_account_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE transactions (
  transaction_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  account_id NUMBER NOT NULL,
  transaction_type VARCHAR2(50) NOT NULL CHECK (transaction_type IN ('DEPOSIT','WITHDRAWAL','TRANSFER')),
  amount NUMBER(18,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR2(10) DEFAULT 'USD' NOT NULL,
  transaction_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  description VARCHAR2(500),
  reference VARCHAR2(100),
  related_account_id NUMBER,
  status VARCHAR2(20) DEFAULT 'COMPLETED' NOT NULL CHECK (status IN ('PENDING','COMPLETED','FAILED')),
  CONSTRAINT fk_transaction_account FOREIGN KEY (account_id) REFERENCES accounts(account_id),
  CONSTRAINT fk_transaction_related_account FOREIGN KEY (related_account_id) REFERENCES accounts(account_id)
);
```

### Phase 3 outcome
After this phase, the database schema is ready. The next phase will map these tables into backend OOP models and services.

### Phase 4 outcome
After this phase, we have a complete OOP design for the backend and a clear mapping from classes to tables and services.

---

## Phase 5 — Project Setup in VS Code

### Goal of this phase
Create the frontend/backend folders, install required dependencies, and set up the Python virtual environment and Next.js starter project.

### Step 1: Create the workspace folders
Run these commands in your terminal from `c:\Users\Hp\bank`:

```powershell
mkdir backend
mkdir frontend
```

### Step 2: Set up the backend environment
From `c:\Users\Hp\bank\backend`:

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install fastapi uvicorn sqlalchemy oracledb python-dotenv passlib[bcrypt] pyjwt
```

Create these backend folders next:

```powershell
mkdir backend\models backend\services backend\routes backend\schemas backend\database backend\utils
```

### Step 3: Set up the frontend environment
From `c:\Users\Hp\bank\frontend`:

```powershell
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --use-npm
npm install
```

This creates a TypeScript-based Next.js app with Tailwind CSS and ESLint.

### Step 4: Create initial backend starter files
Create the following starter files in `backend`:

- `backend/app.py`
- `backend/config.py`
- `backend/database/connection.py`
- `backend/database/base.py`
- `backend/models/user.py`
- `backend/models/customer.py`
- `backend/models/account.py`
- `backend/models/transaction.py`
- `backend/services/auth_service.py`
- `backend/services/customer_service.py`
- `backend/services/account_service.py`
- `backend/services/transaction_service.py`
- `backend/routes/auth.py`
- `backend/routes/customers.py`
- `backend/routes/accounts.py`
- `backend/routes/transactions.py`
- `backend/schemas/auth.py`
- `backend/schemas/customer.py`
- `backend/schemas/account.py`
- `backend/schemas/transaction.py`
- `backend/utils/security.py`
- `backend/utils/jwt.py`
- `backend/utils/validators.py`

### Step 5: Create initial frontend pages and helpers
Create the frontend structure around `app/`, `components/`, and `lib/`:

- `frontend/app/page.tsx`
- `frontend/app/layout.tsx`
- `frontend/app/login/page.tsx`
- `frontend/app/dashboard/page.tsx`
- `frontend/components/Header.tsx`
- `frontend/components/Sidebar.tsx`
- `frontend/components/CustomerForm.tsx`
- `frontend/components/AccountCard.tsx`
- `frontend/lib/api.ts`
- `frontend/lib/auth.ts`

### Step 6: Verify local startup
Run these commands to verify both sides:

Backend:
```powershell
cd backend
venv\Scripts\Activate.ps1
uvicorn app:app --reload --port 8000
```

Frontend:
```powershell
cd frontend
npm run dev
```

### Suggested `.gitignore`
Add root `.gitignore` entries:

```
venv/
__pycache__/
*.pyc
.env
node_modules/
.next/
.DS_Store
```

### Notes
- If `python` is not recognized, use the full executable path or ensure Python is installed and on PATH.
- Oracle Cloud wallet and DB credentials will be added in Phase 6.
- The backend virtual environment stays inside `backend/venv`.

### Phase 5 outcome
After this phase, the project folder structure is created and both frontend and backend environments are ready.

---

## Phase 6 — Oracle Cloud Setup

### Goal of this phase
Create an Oracle Autonomous Database, obtain secure connection credentials, and prepare the backend to connect safely using environment variables.

### Step 1: Create Oracle Cloud account
1. Sign in to Oracle Cloud: https://cloud.oracle.com
2. If you do not have an account, create one and complete verification.
3. Ensure you have access to the Oracle Cloud Console and Autonomous Database service.

### Step 2: Create an Autonomous Database
1. Open the Oracle Cloud Console.
2. Search for `Autonomous Database` and click `Create Autonomous Database`.
3. Set the following values:
   - Deployment type: `Dedicated` or `Shared` (for student projects, `Shared` is fine)
   - Database name: `banking_db`
   - VM cluster: choose a region close to you
   - CPU core count: `1` or `2`
   - Storage: default is fine
4. For administrator credentials, create a secure username and password.
5. Click `Create Autonomous Database` and wait for provisioning.

### Step 3: Download database credentials (wallet)
1. In the Autonomous Database details page, click `DB Connection`.
2. Under `Wallet`, select `Download Wallet`.
3. Provide a wallet password and download the ZIP file.
4. Extract the wallet ZIP to a safe path inside your project or a secure folder, for example:
   - `c:\Users\Hp\bank\backend\wallet`

### Step 4: Get the connection details
1. From the Autonomous Database page, find the `Database Connection` section.
2. Copy the `Connection Strings` for the desired network type, e.g. `adb.us-ashburn-1.oraclecloud.com`, or use the `Easy Connect` string.
3. Note the database username and password you created.

### Step 5: Install `python-oracledb` and Oracle client support
`python-oracledb` runs in thin mode by default. For wallet-based connections, the thin mode is preferred.

### Step 6: Configure backend environment variables
Create `backend/.env` with secure values:

```
ORACLE_USER=your_db_username
ORACLE_PASSWORD=your_db_password
ORACLE_DSN=your_database_connect_string
ORACLE_WALLET_PATH=./wallet
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

> Use an actual strong value for `SECRET_KEY` and do not commit `.env` or wallet files to Git.

### Step 7: Add Oracle wallet and connection files to `.gitignore`
Append these lines to the root `.gitignore`:

```
backend/wallet/
backend/.env
```

### Step 8: Backend connection strategy
Use `python-dotenv` to load environment variables and build the connection in `backend/database/connection.py`.

Example connection strategy:

- If using wallet files: supply `wallet_location` and `dsn`.
- If using easy connect: use `oracledb.connect(user, password, dsn)`.
- Wrap connections in SQLAlchemy engine factories.

### Example backend database loader

```python
# backend/config.py
from pathlib import Path
from dotenv import load_dotenv
import os

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR.parent / '.env')

ORACLE_USER = os.getenv('ORACLE_USER')
ORACLE_PASSWORD = os.getenv('ORACLE_PASSWORD')
ORACLE_DSN = os.getenv('ORACLE_DSN')
ORACLE_WALLET_PATH = os.getenv('ORACLE_WALLET_PATH')
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 60))
```

```python
# backend/database/connection.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from oracledb import makedsn
from config import ORACLE_USER, ORACLE_PASSWORD, ORACLE_DSN, ORACLE_WALLET_PATH

if ORACLE_WALLET_PATH:
    connect_args = {
        'wallet_location': ORACLE_WALLET_PATH,
        'dsn': ORACLE_DSN,
    }
else:
    connect_args = {
        'dsn': ORACLE_DSN,
    }

DATABASE_URL = f"oracle+oracledb://{ORACLE_USER}:{ORACLE_PASSWORD}@{ORACLE_DSN}"
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### Step 9: Validate the Oracle connection
Run a simple script from `backend/` to test connectivity:

```python
from database.connection import engine

with engine.connect() as conn:
    result = conn.execute('SELECT 1 FROM dual')
    print(result.fetchone())
```

### Phase 6 outcome
After this phase, the backend is configured to connect securely to Oracle Cloud, and the database credentials are stored safely in `.env`.

---

## Phase 7 — Backend Foundation (Coding Started)

### Goal of this phase
Start writing backend code for the FastAPI app skeleton, database connection, models, service classes, and API routes.

### What has been created so far
The backend now includes:

- `backend/app.py`
- `backend/config.py`
- `backend/database/base.py`
- `backend/database/connection.py`
- `backend/models/user.py`
- `backend/models/customer.py`
- `backend/models/account.py`
- `backend/models/transaction.py`
- `backend/schemas/auth.py`
- `backend/schemas/customer.py`
- `backend/schemas/account.py`
- `backend/schemas/transaction.py`
- `backend/utils/security.py`
- `backend/utils/jwt.py`
- `backend/utils/validators.py`
- `backend/services/auth_service.py`
- `backend/services/customer_service.py`
- `backend/services/account_service.py`
- `backend/services/transaction_service.py`
- `backend/routes/auth.py`
- `backend/routes/customers.py`
- `backend/routes/accounts.py`
- `backend/routes/transactions.py`

### Phase 7 details
The FastAPI app now includes a root route and health check.
The database connection layer is implemented and ready to use with Oracle.
The first data models and service classes are in place for authentication, customer management, account management, and transactions.

### How to run the backend now
From `c:\Users\Hp\bank\backend`:

```powershell
venv\Scripts\Activate.ps1
uvicorn app:app --reload --port 8000
```

### Phase 7 outcome
The project has officially started coding in the backend. The next phase will refine auth, add route validation, and begin wiring frontend API calls.

---

## Phase 8 — Authentication and User Management

### Goal of this phase
Implement secure registration, login, JWT token handling, and role-based access control for protected endpoints.

### What was added in Phase 8
- `backend/utils/auth.py` with token decoding and current-user dependencies
- JWT token creation using `PyJWT`
- `AuthService.get_user_by_id()` for user validation from token payload
- Protected routes in `backend/routes/customers.py`, `backend/routes/accounts.py`, and `backend/routes/transactions.py`
- `OAuth2PasswordBearer` support for bearer token authorization

### Auth behavior
- `POST /api/auth/register`: create user and a customer profile, return JWT
- `POST /api/auth/login`: validate email/password, return JWT
- Protected endpoints require `Authorization: Bearer <token>`
- Role checks use the token payload and can be extended to `ADMIN`, `EMPLOYEE`, or `MANAGER`

### Example request headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Phase 8 outcome
The backend now supports authentication and route protection. The foundation is ready for account and transaction workflows under authenticated users.

---

## Phase 9 — Banking Core Functions

### Goal of this phase
Build the core banking operations: customer creation, account creation, deposit, withdrawal, transfer, balance inquiry, and transaction history.

### What was implemented
- Added `POST /api/customers/` for creating new customer records
- Added `GET /api/customers/` for listing customers
- Added robust account creation and balance endpoints
- Implemented deposit, withdrawal, and transfer logic in `TransactionService`
- Created dual transaction records for transfers so both source and destination accounts have audit entries
- Added validation for positive amounts and account status checks

### Core endpoints now available
- `POST /api/customers/`
- `GET /api/customers/`
- `GET /api/customers/{customer_id}`
- `POST /api/accounts/`
- `GET /api/accounts/{account_id}/balance`
- `POST /api/transactions/deposit`
- `POST /api/transactions/withdraw`
- `POST /api/transactions/transfer`
- `GET /api/transactions/history/{account_id}`

### Phase 9 outcome
The backend now supports the full MVP banking flow for customers and accounts. Transaction histories and balance checks are available for authenticated users.

---

## Phase 10 — Advanced Banking Modules

### Goal of this phase
Add advanced backend capabilities for loans, cards, branches, employees, admin roles, audits, and notifications.

### What was implemented
- `Branch` management with create/list/get endpoints
- `Employee` records for staff and branch assignments
- `Loan` request and approval flow with role-based approval
- `Card` issuance and card listing
- `AuditLog` record storage for admin review
- `Notification` creation, listing, and read marking

### Advanced endpoints now available
- `POST /api/branches/`
- `GET /api/branches/`
- `GET /api/branches/{branch_id}`
- `POST /api/employees/`
- `GET /api/employees/`
- `GET /api/employees/{employee_id}`
- `POST /api/loans/`
- `GET /api/loans/`
- `POST /api/loans/{loan_id}/approve`
- `POST /api/cards/`
- `GET /api/cards/`
- `GET /api/audit/`
- `POST /api/notifications/`
- `GET /api/notifications/`
- `POST /api/notifications/{notification_id}/read`

### Role-based access notes
- `ADMIN` and `MANAGER` can create branches and employees.
- `MANAGER` and `ADMIN` can approve loans and issue cards.
- `ADMIN` can access audit logs.
- Authenticated users can read their own notifications.

### Phase 10 outcome
The backend now includes advanced banking modules that extend the core MVP and support administrative workflows, audit visibility, and notification handling.

---

## Phase 11 — Frontend Pages and API Wiring

### Goal of this phase
Build the Next.js frontend pages, reusable components, and API integration for login, dashboard, customer management, and account operations.

### What was implemented
- Added a modern landing page in `src/app/page.tsx`
- Created login page and authentication flow in `src/app/login/page.tsx`
- Built dashboard page in `src/app/dashboard/page.tsx`
- Added customer and account pages under `src/app/customers/page.tsx` and `src/app/accounts/page.tsx`
- Added reusable components in `src/components/`
- Added API and auth helpers in `src/lib/`

### Frontend files created
- `frontend/src/components/Header.tsx`
- `frontend/src/components/Sidebar.tsx`
- `frontend/src/components/CustomerForm.tsx`
- `frontend/src/components/AccountCard.tsx`
- `frontend/src/components/DashboardCard.tsx`
- `frontend/src/lib/api.ts`
- `frontend/src/lib/auth.ts`
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/dashboard/page.tsx`
- `frontend/src/app/customers/page.tsx`
- `frontend/src/app/accounts/page.tsx`

### Phase 11 outcome
The frontend is now scaffolded with core banking pages and ready to consume the backend API through token-based login and protected workflows.

---

## Next step after approval
Once you say **continue**, I will move to Phase 12 and add testing coverage, edge-case checks, and example data for both frontend and backend.

> Please review the frontend implementation and say `continue` when ready.
