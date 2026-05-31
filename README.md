# Core Banking & Aether Retail Wallet Management System

A premium, full-stack, responsive Core Banking Management and PalmPay-style Retail Wallet application. Built using Next.js (React) for the frontend, FastAPI (Python) for the backend, and Oracle Autonomous Database / local Oracle DB for secure and scalable persistence.

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Project Architecture & Data Flow](#project-architecture--data-flow)
3. [Folder & File Map](#folder--file-map)
   - [Backend Structure](#1-backend-directory-structure)
   - [Frontend Structure](#2-frontend-directory-structure)
4. [Oracle Database Integration & Fixes](#oracle-database-integration--fixes)
5. [Local Development Setup](#local-development-setup)
   - [Prerequisites](#prerequisites)
   - [Unified Development Launch (Recommended)](#option-a-unified-dev-boot-recommended)
   - [Manual Setup (Separate Terminals)](#option-b-manual-setup-separate-terminals)
6. [Testing the Backend](#testing-the-backend)
7. [Deploying / Pushing to Git](#deploying--pushing-to-git)

---

## Tech Stack

* **Frontend**: Next.js (React), TypeScript, TailwindCSS (Vanilla utility classes with dynamic glassmorphic backgrounds, subtle keyframe animations, and custom vector icons).
* **Backend**: FastAPI (Python 3.13), Uvicorn.
* **ORM & Driver**: SQLAlchemy 2.0 (future-proof standard), `python-oracledb` (thin client mode).
* **Database**: Oracle Autonomous Database / Local Oracle Database (service names like `FREEPDB1`), with automatic failover fallback to local SQLite for isolated testing environments.
* **Security & Auth**: JWT (JSON Web Tokens), `passlib` (bcrypt) for secure password hashing.

---

## Project Architecture & Data Flow

```
   +----------------------+        JSON Requests        +--------------------+
   |  Next.js Frontend    | --------------------------> |   FastAPI Backend  |
   | (PalmPay Wallet UI)  | <-------------------------- |  (Uvicorn Engine)  |
   +----------------------+        JSON Responses       +--------------------+
                                                                  |
                                                                  | SQLAlchemy ORM
                                                                  | (python-oracledb thin)
                                                                  v
                                                        +--------------------+
                                                        |  Oracle Database / |
                                                        | SQLite Fallback DB |
                                                        +--------------------+
```

---

## Folder & File Map

### 1. Backend Directory Structure (`backend/`)
Contains the database layers, business logic, endpoints, schemas, and helper utilities.

```
backend/
 ├── database/               # Database connectivity configurations
 │    ├── base.py            # Instantiates the declarative SQLAlchemy base metadata class.
 │    └── connection.py      # Resilient Oracle engine creator with automatic SQLite fallback.
 ├── models/                 # SQLAlchemy database schema declarations
 │    ├── user.py            # User login accounts, password hashes, and user roles (CUSTOMER, EMPLOYEE, ADMIN).
 │    ├── customer.py        # Customer profile containing personal info (DOB, phone, address).
 │    ├── account.py         # Financial account configurations (SAVINGS, CURRENT, FIXED).
 │    ├── transaction.py     # Log for all money flows (DEPOSIT, WITHDRAWAL, TRANSFER) with constraints.
 │    ├── card.py            # Card metadata (VIRTUAL / PHYSICAL), CVV, expiry dates, and statuses.
 │    ├── loan.py            # Credit applications and manager approval statuses.
 │    ├── employee.py        # Staff records including positional titles and branch assignments.
 │    ├── branch.py          # Brick-and-mortar branch locations, contact numbers, and cities.
 │    ├── audit_log.py       # Tracks administrative actions for internal compliance auditing.
 │    └── notification.py    # Messages pushed directly to the user dashboard.
 ├── services/               # Business logic layers (separates database calls from endpoints)
 │    ├── auth_service.py    # Registration, user authentication, and JWT creation.
 │    ├── customer_service.py# Customer profile query handlers.
 │    ├── account_service.py # Generates 10-digit NUBAN account numbers and opens savings/current accounts.
 │    ├── transaction_service.py # Executes deposits, withdrawals, and dual-record ledger entries for transfers.
 │    ├── card_service.py    # Generates virtual cards with mock attributes and binds them to accounts.
 │    └── loan_service.py    # Evaluates application risks and handles role-based approval transactions.
 ├── routes/                 # FastAPI REST endpoint routing
 │    ├── auth.py            # User registration & login handlers (`/api/auth/register`, `/api/auth/login`).
 │    ├── customers.py       # Customer CRUD routes, profiles, and assignment endpoints.
 │    ├── accounts.py        # Opens accounts, reads balances, and returns customer accounts.
 │    ├── transactions.py    # Triggers ledger updates for deposit, withdrawal, and transfers.
 │    ├── cards.py           # Requests new credit/debit card structures.
 │    ├── loans.py           # Endpoint wrapper for requesting and approving credit lines.
 │    ├── branches.py        # Branch directory listings.
 │    ├── employees.py       # Assigns roles to team members.
 │    ├── audit.py           # Admin endpoint for viewing security logs.
 │    └── notifications.py   # Returns dashboard alerts and marks messages as read.
 ├── schemas/                # Pydantic models for validation and serialization
 │    ├── auth.py            # Validates login requests, registrations, and defines token responses.
 │    ├── customer.py        # Input and output validation shapes for client profile structures.
 │    ├── account.py         # Formats account metadata and balances.
 │    ├── transaction.py     # Sets up rules for deposits, withdrawals, and outbound transfers.
 │    ├── card.py            # Structure schema for masking card information.
 │    └── loan.py            # Defines loan schemas.
 ├── utils/                  # Reusable utility files
 │    ├── security.py        # Bcrypt password hasher and verifier.
 │    ├── jwt.py             # Encodes and decodes authorization tokens with expiration.
 │    ├── auth.py            # FastAPI dependencies to load current users and enforce roles.
 │    └── validators.py      # Common formats checkers (e.g. valid account types or loan status strings).
 ├── tests/                  # Backend pytest validation suite
 │    ├── conftest.py        # Automated test database setup (spins up temp clean SQLite databases).
 │    ├── test_auth.py       # Validates registration and authentication endpoints.
 │    └── test_retail.py     # Simulates customer banking actions (opening savings, transfers, deposits).
 ├── app.py                  # Core FastAPI application initialization, CORS configurations, and router imports.
 ├── config.py               # Handles environment variables loading from `.env`.
 ├── seed.py                 # Drops existing schemas, recreates structures, and populates mock data.
 └── requirements.txt        # Backend dependencies list.
```

---

### 2. Frontend Directory Structure (`frontend/`)
Provides a user interface using Next.js (App Router, Tailwind CSS, and TypeScript).

```
frontend/
 ├── src/
 │    ├── app/               # Next.js pages (App Router)
 │    │    ├── login/        # User sign-in page with validation error handling.
 │    │    ├── register/     # Registration forms for creating a new user profile.
 │    │    ├── dashboard/    # Main landing screen showing balances, shortcuts, and recent history.
 │    │    ├── customers/    # Customer profile update and detail views.
 │    │    ├── accounts/     # Lists active bank accounts and opens new ones.
 │    │    ├── cards/        # Virtual debit cards page with dynamic flip animations and CVV hiding.
 │    │    ├── loans/        # Interactive credit application status boards.
 │    │    ├── services/     # Utilities, shortcuts, and supplementary features dashboard.
 │    │    ├── transactions/ # Transaction logs with date pickers, type filters, and text search.
 │    │    ├── deposit/      # Simulated instant funding deposits.
 │    │    ├── withdrawal/   # Simulated cash withdrawals.
 │    │    ├── transfer/     # Form fields, confirm screen, and downloadable transaction receipts.
 │    │    ├── globals.css   # Main stylesheet containing Tailwind configurations and animations.
 │    │    └── layout.tsx    # Implements HTML head definitions, global styles, and sidebar drawers.
 │    ├── components/        # Reusable UI elements
 │    │    ├── Header.tsx    # Sticky dashboard navigation header with profile context.
 │    │    ├── Sidebar.tsx   # Sidebar navigation drawer with active state highlight.
 │    │    ├── SidebarContext.tsx # Context provider to toggle the sidebar drawer on mobile viewports.
 │    │    ├── BottomNav.tsx # Sticky bottom nav utility bar for mobile phone dimensions.
 │    │    ├── AccountCard.tsx# Visual glassmorphic representation of bank accounts.
 │    │    ├── AccountForm.tsx# Handles forms for opening new savings/checking accounts.
 │    │    ├── CustomerForm.tsx# Profiles settings update handler.
 │    │    ├── DashboardCard.tsx# Highlighting cards for quick metrics metrics.
 │    │    └── TransactionForm.tsx# Fields components for executing withdrawals or deposits.
 │    └── lib/               # Shared frontend utility code
 │         ├── api.ts        # Dynamic gateway utilizing fetch API, handling JWT auth, and triggering redirects on 401.
 │         └── auth.ts       # Manages browser local storage auth token persistence.
 ├── public/                 # Static asset delivery (logos, icons)
 ├── package.json            # Frontend dependency specifications.
 ├── tsconfig.json           # TypeScript configuration settings.
 └── next.config.ts          # Next.js configurations.
```

---

## Oracle Database Integration & Fixes

When migrating this application from SQLite to an Oracle Database environment, several crucial database adjustments were made to ensure full compatibility with the Oracle dialect:

1. **Redundant Indexes Removal (`ORA-01408`)**:
   Oracle automatically creates internal indexes on all primary key columns (`primary_key=True`). Specifying `index=True` on primary key fields in SQLAlchemy models causes the Oracle database engine to fail with `ORA-01408: such column list already indexed`. We removed `index=True` on all primary key definitions in the [models/](file:///c:/Users/Hp/bank/backend/models/) folder.

2. **Auto-Increment Support (`Identity()` / `ORA-01400`)**:
   Oracle does not implicitly support default auto-increment columns for standard integer primary keys. Inserting rows without passing IDs resulted in `ORA-01400: cannot insert NULL into (...)`. 
   To resolve this, we introduced the `Identity()` construct to all models. This compiles dynamically to `GENERATED BY DEFAULT AS IDENTITY` inside Oracle databases, whilst seamlessly compiling back to auto-increment sequences in SQLite environments.
   ```python
   # Example implementation in models
   from sqlalchemy import Column, Integer, Identity
   user_id = Column(Integer, Identity(), primary_key=True)
   ```

---

## Local Development Setup

### Prerequisites
* **Python**: Version 3.10 or higher.
* **Node.js**: Version 18.0 or higher.
* **Oracle Database**: Active local Oracle installation (such as Oracle 23c Free) or a connection to an Autonomous Oracle Cloud database.

---

### Option A: Unified Dev Boot (Recommended)
You can launch both the backend server and the frontend client concurrently with a single command:

1. Configure your environment configuration file:
   - Copy [.env.example](file:///c:/Users/Hp/bank/.env.example) to `backend/.env`
   - Set up your database credentials and ORACLE_DSN in `backend/.env`:
     ```env
     ORACLE_USER=SYSTEM
     ORACLE_PASSWORD=your_password
     ORACLE_DSN=localhost:1521/?service_name=FREEPDB1
     SECRET_KEY=your_jwt_secret_key_here
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=60
     ```

2. Install all dependencies for both frontend and backend:
   ```bash
   npm run install:all
   ```

3. Initialize/seed your database tables:
   ```bash
   python backend/seed.py
   ```

4. Launch both projects concurrently:
   ```bash
   npm run dev
   ```
   * **Next.js Frontend**: Accessible on [http://localhost:3000](http://localhost:3000)
   * **FastAPI Backend**: Accessible on [http://localhost:8000](http://localhost:8000)
   * **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Manual Setup (Separate Terminals)

#### 1. Setup Backend
Open a terminal in the root folder:
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python seed.py
uvicorn app:app --reload --port 8000
```

#### 2. Setup Frontend
Open a separate terminal in the root folder:
```bash
cd frontend
npm install
npm run dev
```

---

## Testing the Backend

A comprehensive test harness is included inside `backend/tests`. It uses a temporary SQLite database to avoid interfering with your development Oracle database.

Run the tests from the `backend/` directory:
```bash
cd backend
pytest -v
```

---

## Deploying / Pushing to Git

To commit and push all structural model fixes and updates to your Git repository:

1. **Stage all changes**:
   ```bash
   git add .
   ```

2. **Commit with a descriptive message**:
   ```bash
   git commit -m "feat: resolve Oracle DB migration conflicts, add PK Identity configurations, and update full system documentation"
   ```

3. **Push to the remote repository**:
   ```bash
   git push origin main
   ```
