from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_products():
    """Verify the product catalog route works."""
    response = client.get("/products")
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_chat_endpoint():
    """Verify the AI can process a shopping query."""
    payload = {"message": "Do you have any leather wallets?"}
    response = client.post("/chat", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "recommended_products" in data
    # Ensure the AI found a wallet if it exists in your mock data
    assert any("wallet" in p["name"].lower() for p in data["recommended_products"])