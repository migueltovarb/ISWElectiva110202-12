import pytest
from sabores.models import Usuario, Categoria, Platillo, Pedido, DetallePedido, MetodoPago, TicketSoporte, MensajeSoporte, Resena
from django.utils import timezone
from datetime import timedelta

@pytest.mark.django_db
def test_crear_usuario():
    user = Usuario.objects.create_user(username='testuser', password='12345', email='test@example.com')
    assert Usuario.objects.count() == 1
    assert user.check_password('12345')

@pytest.mark.django_db
def test_crear_categoria():
    cat = Categoria.objects.create(nombre='Postres', descripcion='Dulces')
    assert str(cat) == 'Postres'

@pytest.mark.django_db
def test_crear_platillo():
    user = Usuario.objects.create_user(username='chef', password='12345')
    cat = Categoria.objects.create(nombre='Bebidas')
    platillo = Platillo.objects.create(
        chef=user,
        nombre='Jugo de Mango',
        descripcion='Refrescante',
        precio=5.5,
        categoria=cat,
        imagen_principal='platillos/jugo.jpg',
        disponible=True,
        tiempo_preparacion=10
    )
    assert platillo.precio == 5.5

@pytest.mark.django_db
def test_pedido_y_detalle():
    user = Usuario.objects.create_user(username='cliente', password='12345')
    cat = Categoria.objects.create(nombre='Comidas')
    platillo = Platillo.objects.create(
        chef=user,
        nombre='Taco',
        descripcion='Mexicano',
        precio=10.0,
        categoria=cat,
        imagen_principal='taco.jpg',
        disponible=True,
        tiempo_preparacion=15
    )
    pedido = Pedido.objects.create(
        cliente=user,
        fecha_entrega=timezone.now() + timedelta(days=1),
        estado='pendiente',
        direccion_entrega='Calle 1',
        total=20.0,
        tipo_pago='efectivo'
    )
    detalle = DetallePedido.objects.create(
        pedido=pedido,
        platillo=platillo,
        cantidad=2,
        precio_unitario=10.0,
        subtotal=20.0
    )
    assert detalle.subtotal == 20.0

@pytest.mark.django_db
def test_metodo_pago():
    user = Usuario.objects.create_user(username='cliente', password='12345')
    metodo = MetodoPago.objects.create(
        usuario=user,
        tipo='tarjeta',
        numero_tarjeta='1234',
        nombre_titular='Juan Cliente',
        fecha_expiracion='12/25',
        es_predeterminado=True
    )
    assert str(metodo) == 'Tarjeta ****1234'

@pytest.mark.django_db
def test_ticket_y_mensaje_soporte():
    user = Usuario.objects.create_user(username='cliente', password='12345')
    pedido = Pedido.objects.create(
        cliente=user,
        fecha_entrega=timezone.now() + timedelta(days=1),
        estado='pendiente',
        direccion_entrega='Calle 2',
        total=25.0,
        tipo_pago='efectivo'
    )
    ticket = TicketSoporte.objects.create(
        usuario=user,
        pedido=pedido,
        asunto='Problema',
        mensaje='No llegó',
        prioridad='alta'
    )
    mensaje = MensajeSoporte.objects.create(
        ticket=ticket,
        usuario=user,
        mensaje='Por favor revisen.',
        es_staff=False
    )
    assert str(ticket).startswith('Ticket')
    assert mensaje.ticket == ticket

@pytest.mark.django_db
def test_resena():
    user = Usuario.objects.create_user(username='cliente', password='12345')
    pedido = Pedido.objects.create(
        cliente=user,
        fecha_entrega=timezone.now(),
        estado='entregado',
        direccion_entrega='Calle 3',
        total=30.0,
        tipo_pago='tarjeta'
    )
    resena = Resena.objects.create(
        cliente=user,
        pedido=pedido,
        calificacion=5,
        comentario='Muy bueno',
        aprobada=True
    )
    assert resena.calificacion == 5
