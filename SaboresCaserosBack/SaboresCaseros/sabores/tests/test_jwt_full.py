
import pytest
from rest_framework.test import APIClient
from sabores.models import Usuario, Categoria, Platillo, Pedido

@pytest.mark.django_db
def test_login_y_token_jwt():
    user = Usuario.objects.create_user(username="cliente", password="123456", email="cliente@example.com")
    client = APIClient()
    response = client.post("/api/token/", {
        "username": "cliente",
        "password": "123456"
    })
    assert response.status_code == 200
    assert "access" in response.data

@pytest.fixture
def auth_client():
    user = Usuario.objects.create_user(username="cliente", password="123456", email="cliente@example.com")
    categoria = Categoria.objects.create(nombre="Rápida")
    platillo = Platillo.objects.create(
        chef=user,
        nombre="Pizza",
        descripcion="Margarita",
        precio=30.0,
        categoria=categoria,
        imagen_principal="pizza.jpg",
        disponible=True,
        tiempo_preparacion=20
    )
    pedido = Pedido.objects.create(
        cliente=user,
        fecha_entrega="2030-01-01T12:00:00Z",
        estado="entregado",
        direccion_entrega="Calle 123",
        total=30.0,
        tipo_pago="efectivo"
    )
    Pedido.objects.create(
        cliente=user,
        fecha_entrega="2030-01-01T14:00:00Z",
        estado="pendiente",
        direccion_entrega="Calle 456",
        total=50.0,
        tipo_pago="tarjeta"
    )
    client = APIClient()
    token_response = client.post("/api/token/", {"username": "cliente", "password": "123456"})
    access_token = token_response.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    return client, user, platillo, pedido

@pytest.mark.django_db
def test_crear_resena(auth_client):
    client, user, _, pedido = auth_client
    data = {
        "pedido": pedido.id,
        "calificacion": 5,
        "comentario": "Excelente servicio"
    }
    response = client.post("/api/resenas/", data)
    assert response.status_code == 201
    assert response.data["calificacion"] == 5

@pytest.mark.django_db
def test_crear_ticket_soporte(auth_client):
    client, user, _, pedido = auth_client
    data = {
        "pedido": pedido.id,
        "asunto": "Problema con el pedido",
        "mensaje": "Faltó un producto",
        "prioridad": "alta"
    }
    response = client.post("/api/tickets/", data)
    assert response.status_code == 201
    assert response.data["estado"] == "abierto"

@pytest.mark.django_db
def test_pedidos_estadisticas(auth_client):
    client, *_ = auth_client
    response = client.get("/api/pedidos/estadisticas/")
    assert response.status_code == 200
    assert "ventas_totales" in response.data["estadisticas"]
    
@pytest.mark.django_db
def test_login_y_token_jwt():
    user = Usuario.objects.create_user(username="cliente", password="123456", email="cliente@example.com")
    client = APIClient()
    response = client.post("/api/token/", {
        "username": "cliente",
        "password": "123456"
    })
    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data

@pytest.mark.django_db
def test_crear_pedido_autenticado():
    user = Usuario.objects.create_user(username="cliente", password="123456", email="cliente@example.com")
    categoria = Categoria.objects.create(nombre="Comidas")
    platillo = Platillo.objects.create(
        chef=user,
        nombre="Hamburguesa",
        descripcion="Con papas",
        precio=20.0,
        categoria=categoria,
        imagen_principal="hamburguesa.jpg",
        disponible=True,
        tiempo_preparacion=15
    )

    client = APIClient()
    token_response = client.post("/api/token/", {"username": "cliente", "password": "123456"})
    access_token = token_response.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    data = {
        "fecha_entrega": "2030-01-01T12:00:00Z",
        "estado": "pendiente",
        "direccion_entrega": "Calle falsa 123",
        "total": 40.0,
        "tipo_pago": "efectivo",
        "notas": "",
        "detalles": [
            {
                "platillo": platillo.id,
                "cantidad": 2,
                "precio_unitario": 20.0
            }
        ]
    }
    response = client.post("/api/pedidos/", data, format="json")
    assert response.status_code == 201
    assert response.data["estado"] == "pendiente"
    assert response.data["detalles"][0]["cantidad"] == 2

