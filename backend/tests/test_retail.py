import pytest

def test_retail_complete_flow(client):
    # --- 1. SETUP TWO CUSTOMERS AND REGISTER ---
    # Register Customer 1
    resp1 = client.post('/api/auth/register', json={
        "email": "customer1@example.com",
        "password": "password",
        "first_name": "Ada",
        "last_name": "Okonkwo"
    })
    assert resp1.status_code == 200
    token1 = resp1.json()['access_token']
    headers1 = {"Authorization": f"Bearer {token1}"}

    # Register Customer 2 (Friend)
    resp2 = client.post('/api/auth/register', json={
        "email": "customer2@example.com",
        "password": "password",
        "first_name": "Tunde",
        "last_name": "Bakare"
    })
    assert resp2.status_code == 200
    token2 = resp2.json()['access_token']
    headers2 = {"Authorization": f"Bearer {token2}"}

    # --- 2. CREATE WALLET ACCOUNTS & VALIDATE NUBAN ---
    # Customer 1 opens SAVINGS account
    acc_resp1 = client.post('/api/accounts/', json={
        "account_type": "SAVINGS",
        "currency": "NGN"
    }, headers=headers1)
    assert acc_resp1.status_code == 200
    account1 = acc_resp1.json()
    assert len(account1['account_number']) == 10
    assert account1['account_number'].startswith('90')

    # Customer 2 opens SAVINGS account
    acc_resp2 = client.post('/api/accounts/', json={
        "account_type": "SAVINGS",
        "currency": "NGN"
    }, headers=headers2)
    assert acc_resp2.status_code == 200
    account2 = acc_resp2.json()
    assert len(account2['account_number']) == 10

    # --- 3. CUSTOMER ISOLATION SECURITY ---
    # Customer 2 should NOT be allowed to view Customer 1's account balance directly
    iso_resp = client.get(f"/api/accounts/{account1['account_id']}/balance", headers=headers2)
    assert iso_resp.status_code in [403, 404]

    # --- 4. PEER-TO-PEER NUBAN LOOKUP ---
    # Lookup Customer 2's account by 10-digit number
    lookup_resp = client.get(f"/api/accounts/lookup?account_number={account2['account_number']}", headers=headers1)
    assert lookup_resp.status_code == 200
    lookup_data = lookup_resp.json()
    assert lookup_data['owner_name'] == "Tunde Bakare"
    assert lookup_data['account_number'] == account2['account_number']

    # --- 5. PEER-TO-PEER TRANSFER & BALANCE UPDATES ---
    # Deposit funds to Customer 1 first
    dep_resp = client.post('/api/transactions/deposit', json={
        "account_id": account1['account_id'],
        "amount": 10000.00,
        "description": "Initial Deposit"
    }, headers=headers1)
    assert dep_resp.status_code == 200

    # Perform peer transfer: Customer 1 -> Customer 2
    xfer_resp = client.post('/api/transactions/transfer', json={
        "account_id": account1['account_id'],
        "target_account_id": account2['account_id'],
        "amount": 4000.00,
        "description": "Sending funds to friend"
    }, headers=headers1)
    assert xfer_resp.status_code == 200

    # Verify Customer 1 balance is 6000.00 (10000 - 4000)
    bal_resp1 = client.get(f"/api/accounts/{account1['account_id']}/balance", headers=headers1)
    assert bal_resp1.json()['balance'] == 6000.00

    # Verify Customer 2 balance is 4000.00
    bal_resp2 = client.get(f"/api/accounts/{account2['account_id']}/balance", headers=headers2)
    assert bal_resp2.json()['balance'] == 4000.00

    # --- 6. SECURE SELF-ISSUANCE OF CO-BRANDED CARDS ---
    card_resp = client.post('/api/cards/', json={
        "account_id": account1['account_id'],
        "card_type": "VIRTUAL"
    }, headers=headers1)
    assert card_resp.status_code == 200
    card_data = card_resp.json()
    assert len(card_data['card_number']) == 16
    assert 'cvv' in card_data
    assert len(card_data['cvv']) == 3

    # View list of Customer 1 cards
    my_cards = client.get('/api/cards/me', headers=headers1)
    assert my_cards.status_code == 200
    assert len(my_cards.json()) == 1
    assert my_cards.json()[0]['card_id'] == card_data['card_id']

    # --- 7. SECURED CREDIT LOANS ---
    loan_resp = client.post('/api/loans/', json={
        "amount": 50000.00,
        "interest_rate": 8.0,
        "term_months": 6
      }, headers=headers1)
    assert loan_resp.status_code == 200
    loan_data = loan_resp.json()
    assert loan_data['amount'] == 50000.00
    assert loan_data['status'] == "PENDING"

    # View Customer 1 requested loans
    my_loans = client.get('/api/loans/me', headers=headers1)
    assert my_loans.status_code == 200
    assert len(my_loans.json()) == 1
    assert my_loans.json()[0]['loan_id'] == loan_data['loan_id']
