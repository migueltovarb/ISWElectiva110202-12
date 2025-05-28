import pytest
from rest_framework.test import APIClient
from sabores.models import Usuario, MetodoPago

@pytest.mark.django_db
def test_no_acceso_sin_auth():
    client = APIClient()
    response = client.get("/api/pedidos/")
    assert response.status_code == 401

@pytest.mark.django_db
def test_no_modificar_otros_metodos_pago():
    user1 = Usuario.objects.create_user(username="user1", password="123")
    user2 = Usuario.objects.create_user(username="user2", password="123")
    metodo = MetodoPago.objects.create(
        usuario=user2,
        tipo="efectivo",
        es_predeterminado=True
    )

    client = APIClient()
    token = client.post("/api/token/", {"username": "user1", "password": "123"}).data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    response = client.put(f"/api/metodos-pago/{metodo.id}/", {"tipo": "tarjeta"})
    assert response.status_code in [403, 404]
