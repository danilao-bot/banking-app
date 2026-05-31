def test_register_and_login(client):
    # Register a new user
    payload = {
        "email": "testuser@example.com",
        "password": "securepassword",
        "first_name": "Test",
        "last_name": "User"
    }
    resp = client.post('/api/auth/register', json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert 'access_token' in data

    # Login with same user
    resp2 = client.post('/api/auth/login', json={"email": "testuser@example.com", "password": "securepassword"})
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert 'access_token' in data2
