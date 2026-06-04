import sys
sys.path.insert(0, '.')

from database.connection import engine
from sqlalchemy import text

print("=" * 60)
print("ORACLE DATABASE VERIFICATION - LUCE BANKING SYSTEM")
print("=" * 60)

with engine.connect() as conn:
    # Get all tables owned by current user
    rows = conn.execute(text("SELECT table_name FROM user_tables ORDER BY table_name")).fetchall()
    
    if not rows:
        print("WARNING: No tables found in Oracle schema!")
    else:
        print(f"\nFound {len(rows)} tables in Oracle:\n")
        for r in rows:
            tbl = r[0]
            cnt = conn.execute(text(f"SELECT COUNT(*) FROM {tbl}")).fetchone()[0]
            status = "OK" if cnt > 0 else "EMPTY"
            print(f"  [{status}]  {tbl:<25} {cnt} rows")

    print("\n" + "=" * 60)
    print("BANKING LOGIC SPOT CHECKS")
    print("=" * 60)

    # Check users exist
    try:
        users = conn.execute(text("SELECT user_id, email, role FROM users")).fetchall()
        print(f"\nUsers ({len(users)}):")
        for u in users:
            print(f"  ID={u[0]}  {u[1]}  role={u[2]}")
    except Exception as e:
        print(f"  ERROR reading users: {e}")

    # Check accounts exist
    try:
        accounts = conn.execute(text(
            "SELECT account_id, account_number, account_type, balance, currency, status FROM accounts"
        )).fetchall()
        print(f"\nAccounts ({len(accounts)}):")
        for a in accounts:
            print(f"  ID={a[0]}  #{a[1]}  {a[2]}  Balance={a[5]}{a[3]:>12}  Status={a[4]}")
    except Exception as e:
        print(f"  ERROR reading accounts: {e}")

    # Check transactions
    try:
        txns = conn.execute(text(
            "SELECT transaction_id, transaction_type, amount, status FROM transactions"
        )).fetchall()
        print(f"\nTransactions ({len(txns)}):")
        for t in txns:
            print(f"  ID={t[0]}  {t[1]:<12} NGN {t[2]:>12}  Status={t[3]}")
    except Exception as e:
        print(f"  ERROR reading transactions: {e}")

    # Check loans
    try:
        loans = conn.execute(text(
            "SELECT loan_id, amount, status FROM loans"
        )).fetchall()
        print(f"\nLoans ({len(loans)}):")
        for l in loans:
            print(f"  ID={l[0]}  Amount={l[1]}  Status={l[2]}")
    except Exception as e:
        print(f"  ERROR reading loans: {e}")

    # Verify Oracle identity
    try:
        db_info = conn.execute(text(
            "SELECT SYS_CONTEXT('USERENV','DB_NAME'), SYS_CONTEXT('USERENV','SESSION_USER') FROM DUAL"
        )).fetchone()
        print(f"\nOracle Instance: {db_info[0]}  |  Connected as: {db_info[1]}")
    except Exception as e:
        print(f"  ERROR getting db info: {e}")

print("\n" + "=" * 60)
print("VERIFICATION COMPLETE")
print("=" * 60)
