import pytest
from rest_framework.test import APIClient
from sabores.models import Usuario

@pytest.mark.django_db
def test_usuarios_filtrar_chefs():
    Usuario.objects.create_user(username="chef1", password="123", es_chef=True)
    Usuario.objects.create_user(username="user2", password="123")
    admin = Usuario.objects.create_superuser(username="admin", password="adminpass")

    client = APIClient()
    token = client.post("/api/token/", {"username": "admin", "password": "adminpass"}).data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    response = client.get("/api/usuarios/chefs/")
    assert response.status_code == 200
    usernames = [u["username"] for u in response.data]
    assert "chef1" in usernames
    assert "user2" not in usernames
