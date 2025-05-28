import pytest
from rest_framework.test import APIClient
from sabores.models import Usuario

@pytest.mark.django_db
def test_pedido_sin_detalles():
    user = Usuario.objects.create_user(username="cliente", password="123456")
    client = APIClient()
    token = client.post("/api/token/", {"username": "cliente", "password": "123456"}).data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    data = {
        "fecha_entrega": "2030-01-01T10:00:00Z",
        "estado": "pendiente",
        "direccion_entrega": "Calle 123",
        "total": 0.0,
        "tipo_pago": "efectivo",
        "notas": "",
        "detalles": []
    }
    response = client.post("/api/pedidos/", data)
    assert response.status_code == 400
    assert "detalles" in response.data
