# Object-Oriented Programming (OOP) Architectural Paradigms

This document outlines the software engineering and Object-Oriented design principles (Abstraction, Encapsulation, Inheritance, and Polymorphism) utilized throughout the development of the Aether Core Banking & Wallet Management system.

---

## 1. Abstraction 🏛️
Abstraction is the process of hiding complex implementation details and exposing only the essential features.

### Backend Data Access & ORM
* **SQLAlchemy Declarative Base**: Raw database queries (e.g. SQLite dialect, Oracle Autonomous indexes) are completely abstracted using SQLAlchemy's declarative engine. Models inherit from a unified `Base` class, abstracting low-level SQL tables as Python objects:
  ```python
  from database.base import Base
  class Account(Base):
      __tablename__ = 'accounts'
      # Details are abstracted to Python properties
  ```
* **Service Layer Pattern**: Controllers (FastAPI router endpoints) do not write database queries. Instead, database operations are abstracted behind **Service Classes** (e.g. `AccountService`, `TransactionService`, `AuthService`).
  ```python
  # API endpoint simply calls the abstracted service
  service = TransactionService(db)
  transaction = service.transfer(source_id, target_id, amount)
  ```

### Frontend Form Logic Abstraction
* **Polymorphic Form Component (`TransactionForm.tsx`)**: Instead of pages managing form validation, inputs, error states, and API endpoints directly, the `TransactionForm` component abstracts the transactional interface. Pages simply pass simple handler hooks like `onConfirm` or `onSuccess` and a mode string.

---

## 2. Encapsulation 🔒
Encapsulation packages data and the methods that operate on that data into a single unit (class), protecting it from direct outer access.

### Database Constraints & Relational Models
* Database models encapsulate both data structure and business constraints using `CheckConstraint`:
  ```python
  class Transaction(Base):
      # Hiding internal representation and enforcing constraints:
      __table_args__ = (
          CheckConstraint("transaction_type IN ('DEPOSIT','WITHDRAWAL','TRANSFER')"),
          CheckConstraint('amount > 0'),
      )
  ```
* Relationships (e.g., `customer = relationship('Customer', back_populates='accounts')`) encapsulate foreign key lookups and lazy loading, keeping table joins out of business logic.

### Authentication & API Security Utils
* Hashing processes (bcrypt encryption) are encapsulated in `utils/security.py`, meaning password credentials can never be handled as raw strings outside the auth service.
* Token compilation/validation is encapsulated in `utils/jwt.py`.
* The frontend API client (`frontend/src/lib/api.ts`) encapsulates authorization header insertion, token extraction, and response formatting, hiding fetch internals.

---

## 3. Inheritance 🧬
Inheritance allows one class to inherit attributes and methods from a parent class, promoting code reusability.

### SQLAlchemy Base Inheritance
* Every model inherits from `database.base.Base` which registers schemas into the global SQLAlchemy metadata engine.
  ```python
  from database.base import Base
  class Card(Base):
      ...
  ```

### Pydantic Validation Inheritance
* API schemas use inheritance to share input/output properties across request shapes. For example, specific schema models inherit from Pydantic's `BaseModel`:
  ```python
  from pydantic import BaseModel
  
  class AccountCreate(BaseModel):
      account_type: str
      currency: str
  ```

---

## 4. Polymorphism 🎭
Polymorphism allows objects of different types to respond to the same interface, or a single component to take multiple forms.

### Transaction Behavior Polymorphism
* The backend services expose polymorphic behaviors inside `TransactionService`:
  * Depositing (`deposit()`), withdrawing (`withdraw()`), and transferring (`transfer()`) perform completely different mathematical operations and ledger checks under the hood, but are all recorded as a `Transaction` class instance in the database using the same `TransactionResponse` output interface.

### UI Form Polymorphism
* The frontend `TransactionForm` changes its form input requirements, button action labels, and endpoint triggers dynamically using a `mode` parameter:
  ```typescript
  type TransactionFormProps = {
    mode: 'deposit' | 'withdraw' | 'transfer';
  };
  ```
  When the mode is `'transfer'`, it automatically triggers real-time NUBAN account validation and verified recipient owner cards. When it is `'deposit'` or `'withdraw'`, it renders appropriate deposit portals and disables receiver forms, polymorphic of its context.
