
import pytest
from rest_framework.test import APIClient
from sabores.models import Usuario

@pytest.mark.django_db
def test_verificar_pregunta_seguridad():
    user = Usuario.objects.create_user(
        username="cliente", password="123456", email="cliente@example.com",
        pregunta_seguridad="¿Color favorito?", respuesta_seguridad="azul"
    )
    client = APIClient()
    response = client.post("/api/verificar-pregunta/", {"username": "cliente"})
    assert response.status_code == 200
    assert response.data["pregunta"] == "¿Color favorito?"

@pytest.mark.django_db
def test_recuperar_password_con_respuesta_correcta():
    user = Usuario.objects.create_user(
        username="cliente2", password="original123", email="cliente2@example.com",
        pregunta_seguridad="¿Color favorito?", respuesta_seguridad="verde"
    )
    client = APIClient()
    response = client.post("/api/recuperar-password/", {
        "usuario_id": user.id,
        "respuesta": "Verde",  # Debe hacer match con "verde" sin importar mayúsculas
        "nueva_password": "nuevaclave456"
    })
    assert response.status_code == 200
    assert "Contraseña actualizada" in response.data["mensaje"]

    # Confirmar login con la nueva contraseña
    login = client.post("/api/token/", {
        "username": "cliente2",
        "password": "nuevaclave456"
    })
    assert login.status_code == 200
    assert "access" in login.data

@pytest.mark.django_db
def test_recuperar_password_con_respuesta_incorrecta():
    user = Usuario.objects.create_user(
        username="cliente3", password="123456", email="cliente3@example.com",
        pregunta_seguridad="¿Animal favorito?", respuesta_seguridad="perro"
    )
    client = APIClient()
    response = client.post("/api/recuperar-password/", {
        "usuario_id": user.id,
        "respuesta": "gato",  # Incorrecto
        "nueva_password": "clavefalsa"
    })
    assert response.status_code == 400
    assert "incorrecta" in response.data["error"]
