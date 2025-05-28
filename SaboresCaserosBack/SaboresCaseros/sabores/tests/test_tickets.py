import pytest
from rest_framework.test import APIClient
from sabores.models import Usuario, Pedido

@pytest.mark.django_db
def test_crear_y_listar_tickets():
    user = Usuario.objects.create_user(username="cliente", password="123456")
    pedido = Pedido.objects.create(
        cliente=user,
        fecha_entrega="2030-01-01T12:00:00Z",
        estado="pendiente",
        direccion_entrega="Calle X",
        total=45.0,
        tipo_pago="tarjeta"
    )
    client = APIClient()
    token = client.post("/api/token/", {"username": "cliente", "password": "123456"}).data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    data = {
        "pedido": pedido.id,
        "asunto": "Error en pedido",
        "mensaje": "No llegó completo",
        "prioridad": "alta"
    }
    post_resp = client.post("/api/tickets/", data)
    assert post_resp.status_code == 201

    get_resp = client.get("/api/tickets/")
    assert get_resp.status_code == 200
    assert len(get_resp.data) == 1
