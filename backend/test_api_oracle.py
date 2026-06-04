"""
End-to-end Oracle API verification for Aether Banking System
Tests all core banking routes against the live Oracle database
"""
import sys
import json
import urllib.request
import urllib.error

BASE = "http://127.0.0.1:8000"
TOKEN = None
RESULTS = []

def req(method, path, body=None, auth=False):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if auth and TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    try:
        r = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(r, timeout=10) as res:
            return res.status, json.loads(res.read())
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read())
        except:
            return e.code, {"error": str(e)}
    except Exception as e:
        return 0, {"error": str(e)}

def check(label, status, data, expect_status=200):
    ok = status == expect_status
    icon = "PASS" if ok else "FAIL"
    RESULTS.append((icon, label, status))
    print(f"  [{icon}] {label} -> HTTP {status}")
    if not ok:
        print(f"         Response: {data}")
    return ok, data

print("=" * 60)
print("AETHER BANK - ORACLE API END-TO-END TEST")
print("=" * 60)

# 1. Health check
print("\n-- Health --")
s, d = req("GET", "/api/health")
check("Health endpoint", s, d)

# 2. Login as Customer 1
print("\n-- Authentication --")
s, d = req("POST", "/api/auth/login", {"email": "user@example.com", "password": "password"})
ok, data = check("Login (user@example.com)", s, d)
if ok and "access_token" in data:
    TOKEN = data["access_token"]
    print(f"         Token acquired: {TOKEN[:30]}...")

# 3. Get current user profile
print("\n-- Customer Profile --")
s, d = req("GET", "/api/auth/me", auth=True)
check("GET /api/auth/me", s, d)

# 4. List accounts
print("\n-- Accounts --")
s, d = req("GET", "/api/accounts", auth=True)
check("GET /api/accounts", s, d)
account_id = None
if isinstance(d, list) and len(d) > 0:
    account_id = d[0].get("account_id")
    print(f"         Found {len(d)} accounts. First account_id={account_id}")

# 5. Get transaction history
print("\n-- Transactions --")
s, d = req("GET", "/api/transactions", auth=True)
check("GET /api/transactions", s, d)
if isinstance(d, list):
    print(f"         Found {len(d)} transactions")

# 6. Peer-to-peer transfer
print("\n-- Transfer (P2P) --")
s, d = req("POST", "/api/transactions/transfer", {
    "to_account_number": "9000002001",
    "amount": 1000,
    "description": "Oracle API test transfer"
}, auth=True)
check("POST /api/transactions/transfer", s, d, expect_status=200)

# 7. Loan list
print("\n-- Loans --")
s, d = req("GET", "/api/loans", auth=True)
check("GET /api/loans", s, d)

# 8. Cards list
print("\n-- Cards --")
s, d = req("GET", "/api/cards", auth=True)
check("GET /api/cards", s, d)

# 9. Notifications
print("\n-- Notifications --")
s, d = req("GET", "/api/notifications", auth=True)
check("GET /api/notifications", s, d)

# 10. Register new user (gets ₦500,000 bonus)
print("\n-- New User Registration (₦500k Bonus) --")
s, d = req("POST", "/api/auth/register", {
    "email": "oracletest@aether.ng",
    "password": "TestPass123!",
    "first_name": "Oracle",
    "last_name": "Test",
    "phone": "08099990000",
    "date_of_birth": "1990-01-01",
    "address": "1 Oracle Street, Lagos"
})
check("POST /api/auth/register (new user)", s, d, expect_status=201)

print("\n" + "=" * 60)
passed = sum(1 for r in RESULTS if r[0] == "PASS")
failed = sum(1 for r in RESULTS if r[0] == "FAIL")
print(f"RESULTS: {passed} PASSED  |  {failed} FAILED  |  {len(RESULTS)} TOTAL")
print("=" * 60)
if failed == 0:
    print("ALL ORACLE API TESTS PASSED!")
else:
    print("Some tests failed. Check output above.")
    sys.exit(1)
