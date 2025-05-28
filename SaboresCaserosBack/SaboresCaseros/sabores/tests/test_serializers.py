import pytest
from sabores.models import Usuario, Categoria, Platillo, Pedido
from sabores.serializers import UsuarioSerializer, CategoriaSerializer, PlatilloSerializer, PedidoSerializer
from datetime import timedelta
from django.utils import timezone

@pytest.mark.django_db
def test_usuario_serializer_create():
    data = {
        "username": "juan",
        "email": "juan@example.com",
        "password": "12345678",
        "first_name": "Juan",
        "last_name": "Pérez",
        "pregunta_seguridad": "Color favorito",
        "respuesta_seguridad": "Azul"
    }
    serializer = UsuarioSerializer(data=data)
    assert serializer.is_valid()
    user = serializer.save()
    assert user.username == "juan"
    assert user.respuesta_seguridad == "azul"

@pytest.mark.django_db
def test_categoria_serializer():
    cat = Categoria.objects.create(nombre="Entradas")
    serializer = CategoriaSerializer(cat)
    assert serializer.data["nombre"] == "Entradas"

@pytest.mark.django_db
def test_platillo_serializer():
    chef = Usuario.objects.create_user(username="chef", password="123456")
    cat = Categoria.objects.create(nombre="Postres")
    platillo = Platillo.objects.create(
        chef=chef,
        nombre="Tarta",
        descripcion="Fresa",
        precio=12.5,
        categoria=cat,
        imagen_principal="tarta.jpg",
        disponible=True,
        tiempo_preparacion=20
    )
    serializer = PlatilloSerializer(platillo)
    assert serializer.data["chef_nombre"] == "chef"

@pytest.mark.django_db
def test_pedido_serializer_create():
    user = Usuario.objects.create_user(username="cliente", password="123456")
    cat = Categoria.objects.create(nombre="Principal")
    platillo = Platillo.objects.create(
        chef=user,
        nombre="Pasta",
        descripcion="Pesto",
        precio=15.0,
        categoria=cat,
        imagen_principal="pasta.jpg",
        disponible=True,
        tiempo_preparacion=15
    )
    data = {
        "fecha_entrega": (timezone.now() + timedelta(days=1)).isoformat(),
        "estado": "pendiente",
        "direccion_entrega": "Calle 1 #2-3",
        "total": 30.0,
        "tipo_pago": "efectivo",
        "notas": "",
        "detalles": [
            {
                "platillo": platillo.id,
                "cantidad": 2,
                "precio_unitario": 15.0
            }
        ]
    }
    serializer = PedidoSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    pedido = serializer.save(cliente=user)
    assert pedido.detalles.count() == 1
