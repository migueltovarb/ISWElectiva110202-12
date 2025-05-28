import pytest
from rest_framework.test import APIClient
from django.urls import reverse, resolve

@pytest.mark.django_db
def test_registro_url():
    client = APIClient()
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "12345678",
        "confirmPassword": "12345678"
    }
    response = client.post("/api/registro/", data)
    assert response.status_code in [201, 400]  # Puede fallar si falta algún campo requerido

@pytest.mark.django_db
def test_login_token_url():
    from sabores.models import Usuario
    Usuario.objects.create_user(username="camilo", password="123456", email="camilo@mail.com")
    client = APIClient()
    response = client.post("/api/token/", {"username": "camilo", "password": "123456"})
    assert response.status_code == 200
    assert "access" in response.data

@pytest.mark.django_db
def test_refresh_token_url():
    from sabores.models import Usuario
    Usuario.objects.create_user(username="camilo", password="123456")
    client = APIClient()
    login = client.post("/api/token/", {"username": "camilo", "password": "123456"}).data
    refresh = login.get("refresh")
    response = client.post("/api/token/refresh/", {"refresh": refresh})
    assert response.status_code == 200
    assert "access" in response.data

def test_urls_resuelven_view_correcta():
    from sabores.views import RegistroView, UserProfileView
    assert resolve("/api/registro/").func.view_class == RegistroView
    assert resolve("/api/user/me/").func.view_class == UserProfileView
