from typing import List


def validate_account_type(account_type: str) -> bool:
    return account_type.upper() in ['SAVINGS', 'CURRENT', 'FIXED']


def validate_transaction_type(transaction_type: str) -> bool:
    return transaction_type.upper() in ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER']


def validate_role(role: str) -> bool:
    return role.upper() in ['CUSTOMER', 'EMPLOYEE', 'ADMIN', 'MANAGER']
