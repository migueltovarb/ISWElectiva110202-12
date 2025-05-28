import pytest
from rest_framework.test import APIClient
from sabores.models import Usuario, Categoria, Platillo

@pytest.mark.django_db
def test_registro_usuario():
    client = APIClient()
    data = {
        "username": "nuevo",
        "email": "nuevo@example.com",
        "password": "12345678",
        "confirmPassword": "12345678",
        "first_name": "Nuevo",
        "last_name": "Usuario"
    }
    response = client.post("/api/registro/", data)
    assert response.status_code == 201
    assert response.data["username"] == "nuevo"

@pytest.mark.django_db
def test_perfil_usuario_get_patch():
    user = Usuario.objects.create_user(username="camilo", password="123456", email="camilo@correo.com")
    client = APIClient()
    client.force_authenticate(user=user)

    # GET perfil
    response_get = client.get("/api/user/me/")
    assert response_get.status_code == 200
    assert response_get.data["username"] == "camilo"

    # PATCH perfil
    patch_data = {"telefono": "123456789"}
    response_patch = client.patch("/api/user/me/", patch_data)
    assert response_patch.status_code == 200
    assert response_patch.data["telefono"] == "123456789"

@pytest.mark.django_db
def test_platillos_categoria_filtrado():
    user = Usuario.objects.create_user(username="chef", password="123456")
    cat1 = Categoria.objects.create(nombre="Bebidas")
    cat2 = Categoria.objects.create(nombre="Postres")

    Platillo.objects.create(
        chef=user,
        nombre="Jugo",
        descripcion="Natural",
        precio=5,
        categoria=cat1,
        imagen_principal="jugo.jpg",
        disponible=True,
        tiempo_preparacion=5
    )
    Platillo.objects.create(
        chef=user,
        nombre="Pastel",
        descripcion="Chocolate",
        precio=8,
        categoria=cat2,
        imagen_principal="pastel.jpg",
        disponible=True,
        tiempo_preparacion=10
    )

    client = APIClient()
    response = client.get(f"/api/platillos/?categoria={cat1.id}")
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["nombre"] == "Jugo"

@pytest.mark.django_db
def test_crear_metodo_pago():
    user = Usuario.objects.create_user(username="cliente", password="123456")
    client = APIClient()
    client.force_authenticate(user=user)

    data = {
        "tipo": "tarjeta",
        "numero_tarjeta": "1234",
        "nombre_titular": "Camilo Cliente",
        "fecha_expiracion": "12/25",
        "es_predeterminado": True
    }
    response = client.post("/api/metodos-pago/", data)
    assert response.status_code == 201
    assert response.data["tipo"] == "tarjeta"
