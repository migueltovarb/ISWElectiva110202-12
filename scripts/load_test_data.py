import os
import django
import random
from decimal import Decimal

# Configuración del entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sabores_caseros.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.menu.models import Category, MenuItem
from apps.orders.models import Order, OrderItem

User = get_user_model()

def create_test_users():
    """Crear usuarios de prueba: cliente, administrador y staff"""
    
    # Crear admin si no existe
    if not User.objects.filter(email='admin@sabores.com').exists():
        admin = User.objects.create_user(
            email='admin@sabores.com',
            password='admin123',
            name='Administrador',
            role='admin',
            is_staff=True,
            is_superuser=True
        )
        print(f"Administrador creado: {admin.email}")
    
    # Crear cliente si no existe
    if not User.objects.filter(email='cliente@ejemplo.com').exists():
        client = User.objects.create_user(
            email='cliente@ejemplo.com',
            password='cliente123',
            name='Cliente Ejemplo',
            phone='1234567890',
            address='Calle Principal 123, Ciudad',
            role='cliente'
        )
        print(f"Cliente creado: {client.email}")
    
    # Crear staff si no existe
    if not User.objects.filter(email='staff@sabores.com').exists():
        staff = User.objects.create_user(
            email='staff@sabores.com',
            password='staff123',
            name='Personal Restaurante',
            role='staff',
            is_staff=True
        )
        print(f"Staff creado: {staff.email}")


def create_menu_items():
    """Crear categorías y elementos del menú"""
    
    # Categorías
    categories = [
        {'name': 'Entradas', 'description': 'Platillos para comenzar'},
        {'name': 'Platos Principales', 'description': 'Especialidades de la casa'},
        {'name': 'Postres', 'description': 'Dulces y delicias'},
        {'name': 'Bebidas', 'description': 'Refrescos, jugos y más'}
    ]
    
    for cat_data in categories:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        if created:
            print(f"Categoría creada: {category.name}")
    
    # Obtener las categorías
    entradas = Category.objects.get(name='Entradas')
    principales = Category.objects.get(name='Platos Principales')
    postres = Category.objects.get(name='Postres')
    bebidas = Category.objects.get(name='Bebidas')
    
    # Elementos del menú
    menu_items = [
        {
            'name': 'Empanadas caseras', 
            'description': 'Empanadas de carne, pollo o queso', 
            'price': Decimal('4.99'), 
            'category': entradas,
            'is_featured': True
        },
        {
            'name': 'Ensalada mixta', 
            'description': 'Lechugas, tomate, zanahoria, huevo y aderezo', 
            'price': Decimal('5.50'), 
            'category': entradas
        },
        {
            'name': 'Milanesa con puré', 
            'description': 'Milanesa de ternera con puré de papas', 
            'price': Decimal('12.99'), 
            'category': principales,
            'is_featured': True
        },
        {
            'name': 'Pasta al pesto', 
            'description': 'Fettuccine con salsa de albahaca, nueces y parmesano', 
            'price': Decimal('10.50'), 
            'category': principales
        },
        {
            'name': 'Lomo a la pimienta', 
            'description': 'Lomo de cerdo con salsa de pimienta y papas', 
            'price': Decimal('14.99'), 
            'category': principales
        },
        {
            'name': 'Flan casero', 
            'description': 'Flan con caramelo y dulce de leche', 
            'price': Decimal('4.50'), 
            'category': postres,
            'is_featured': True
        },
        {
            'name': 'Brownie con helado', 
            'description': 'Brownie tibio con helado de vainilla', 
            'price': Decimal('5.99'), 
            'category': postres
        },
        {
            'name': 'Agua mineral', 
            'description': 'Botella 500ml', 
            'price': Decimal('1.50'), 
            'category': bebidas
        },
        {
            'name': 'Limonada casera', 
            'description': 'Vaso de limonada fresca', 
            'price': Decimal('2.99'), 
            'category': bebidas,
            'is_featured': True
        }
    ]
    
    for item_data in menu_items:
        menu_item, created = MenuItem.objects.get_or_create(
            name=item_data['name'],
            defaults={
                'description': item_data['description'],
                'price': item_data['price'],
                'category': item_data['category'],
                'is_featured': item_data.get('is_featured', False),
                'preparation_time': random.randint(10, 30)
            }
        )
        if created:
            print(f"Ítem del menú creado: {menu_item.name}")


def create_sample_orders():
    """Crear pedidos de ejemplo"""
    
    # Solo crear si no hay pedidos
    if Order.objects.count() == 0:
        try:
            client = User.objects.get(email='cliente@ejemplo.com')
            
            # Crear pedido
            order = Order.objects.create(
                user=client,
                total_amount=Decimal('23.48'),
                delivery_address='Calle Principal 123, Ciudad',
                payment_method='efectivo',
                status='confirmado',
                notes='Por favor, incluir condimentos extra'
            )
            
            # Agregar ítems al pedido
            menu_items = MenuItem.objects.filter(is_featured=True)[:3]
            
            for item in menu_items:
                OrderItem.objects.create(
                    order=order,
                    menu_item=item,
                    quantity=1,
                    price=item.price
                )
            
            print(f"Pedido de muestra creado: {order.order_code}")
        
        except User.DoesNotExist:
            print("No se pudo crear pedido: usuario cliente no encontrado")


if __name__ == '__main__':
    print("Cargando datos de prueba para Sabores Caseros...")
    create_test_users()
    create_menu_items()
    create_sample_orders()
import os
import django
import random
from decimal import Decimal

# Configuración del entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sabores_caseros.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.menu.models import Category, MenuItem
from apps.orders.models import Order, OrderItem

User = get_user_model()

def create_test_users():
    """Crear usuarios de prueba: cliente, administrador y staff"""
    
    # Crear admin si no existe
    if not User.objects.filter(email='admin@sabores.com').exists():
        admin = User.objects.create_user(
            email='admin@sabores.com',
            password='admin123',
            name='Administrador',
            role='admin',
            is_staff=True,
            is_superuser=True
        )
        print(f"Administrador creado: {admin.email}")
    
    # Crear cliente si no existe
    if not User.objects.filter(email='cliente@ejemplo.com').exists():
        client = User.objects.create_user(
            email='cliente@ejemplo.com',
            password='cliente123',
            name='Cliente Ejemplo',
            phone='1234567890',
            address='Calle Principal 123, Ciudad',
            role='cliente'
        )
        print(f"Cliente creado: {client.email}")
    
    # Crear staff si no existe
    if not User.objects.filter(email='staff@sabores.com').exists():
        staff = User.objects.create_user(
            email='staff@sabores.com',
            password='staff123',
            name='Personal Restaurante',
            role='staff',
            is_staff=True
        )
        print(f"Staff creado: {staff.email}")


def create_menu_items():
    """Crear categorías y elementos del menú"""
    
    # Categorías
    categories = [
        {'name': 'Entradas', 'description': 'Platillos para comenzar'},
        {'name': 'Platos Principales', 'description': 'Especialidades de la casa'},
        {'name': 'Postres', 'description': 'Dulces y delicias'},
        {'name': 'Bebidas', 'description': 'Refrescos, jugos y más'},
        {'name': 'Ensaladas', 'description': 'Opciones frescas y saludables'},
        {'name': 'Pizzas', 'description': 'Nuestras especialidades horneadas'},
        {'name': 'Parrilla', 'description': 'Carnes a la parrilla'}
    ]
    
    for cat_data in categories:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        if created:
            print(f"Categoría creada: {category.name}")
    
    # Obtener las categorías
    entradas = Category.objects.get(name='Entradas')
    principales = Category.objects.get(name='Platos Principales')
    postres = Category.objects.get(name='Postres')
    bebidas = Category.objects.get(name='Bebidas')
    ensaladas = Category.objects.get(name='Ensaladas')
    pizzas = Category.objects.get(name='Pizzas')
    parrilla = Category.objects.get(name='Parrilla')
    
    # Elementos del menú - ampliados para el Sprint 2
    menu_items = [
        # Entradas
        {
            'name': 'Empanadas caseras', 
            'description': 'Empanadas de carne, pollo o queso', 
            'price': Decimal('4.99'), 
            'category': entradas,
            'is_featured': True
        },
        {
            'name': 'Rabas', 
            'description': 'Calamares fritos con salsa alioli', 
            'price': Decimal('8.50'), 
            'category': entradas
        },
        {
            'name': 'Nachos con guacamole', 
            'description': 'Totopos con guacamole fresco, queso y pico de gallo', 
            'price': Decimal('7.99'), 
            'category': entradas,
            'is_featured': True
        },
        {
            'name': 'Provoleta', 
            'description': 'Queso provolone a la parrilla con orégano y aceite de oliva', 
            'price': Decimal('6.50'), 
            'category': entradas
        },
        
        # Platos principales
        {
            'name': 'Milanesa con puré', 
            'description': 'Milanesa de ternera con puré de papas', 
            'price': Decimal('12.99'), 
            'category': principales,
            'is_featured': True
        },
        {
            'name': 'Pasta al pesto', 
            'description': 'Fettuccine con salsa de albahaca, nueces y parmesano', 
            'price': Decimal('10.50'), 
            'category': principales
        },
        {
            'name': 'Lomo a la pimienta', 
            'description': 'Lomo de cerdo con salsa de pimienta y papas', 
            'price': Decimal('14.99'), 
            'category': principales
        },
        {
            'name': 'Pollo al limón', 
            'description': 'Pechuga de pollo al limón con verduras salteadas', 
            'price': Decimal('11.50'), 
            'category': principales
        },
        {
            'name': 'Risotto de hongos', 
            'description': 'Arroz cremoso con hongos y parmesano', 
            'price': Decimal('11.99'), 
            'category': principales
        },
        
        # Postres
        {
            'name': 'Flan casero', 
            'description': 'Flan con caramelo y dulce de leche', 
            'price': Decimal('4.50'), 
            'category': postres,
            'is_featured': True
        },
        {
            'name': 'Brownie con helado', 
            'description': 'Brownie tibio con helado de vainilla', 
            'price': Decimal('5.99'), 
            'category': postres
        },
        {
            'name': 'Tiramisú', 
            'description': 'Postre italiano de café y mascarpone', 
            'price': Decimal('5.50'), 
            'category': postres
        },
        {
            'name': 'Cheesecake', 
            'description': 'Tarta de queso con salsa de frutos rojos', 
            'price': Decimal('6.50'), 
            'category': postres,
            'is_featured': True
        },
        
        # Bebidas
        {
            'name': 'Agua mineral', 
            'description': 'Botella 500ml', 
            'price': Decimal('1.50'), 
            'category': bebidas
        },
        {
            'name': 'Limonada casera', 
            'description': 'Vaso de limonada fresca', 
            'price': Decimal('2.99'), 
            'category': bebidas,
            'is_featured': True
        },
        {
            'name': 'Vino tinto de la casa', 
            'description': 'Copa de vino tinto Malbec', 
            'price': Decimal('4.50'), 
            'category': bebidas
        },
        {
            'name': 'Cerveza artesanal', 
            'description': 'Botella de cerveza artesanal local', 
            'price': Decimal('5.99'), 
            'category': bebidas
        },
        
        # Ensaladas
        {
            'name': 'Ensalada César', 
            'description': 'Lechuga romana, pollo, crutones, parmesano y aderezo César', 
            'price': Decimal('8.99'), 
            'category': ensaladas
        },
        {
            'name': 'Ensalada Mediterránea', 
            'description': 'Tomate, pepino, cebolla, aceitunas, queso feta y vinagreta', 
            'price': Decimal('9.50'), 
            'category': ensaladas,
            'is_featured': True
        },
        
        # Pizzas
        {
            'name': 'Pizza Margherita', 
            'description': 'Salsa de tomate, mozzarella y albahaca', 
            'price': Decimal('10.99'), 
            'category': pizzas
        },
        {
            'name': 'Pizza Especial', 
            'description': 'Jamón, morrón, aceitunas y mozzarella', 
            'price': Decimal('12.50'), 
            'category': pizzas,
            'is_featured': True
        },
        {
            'name': 'Pizza Cuatro Quesos', 
            'description': 'Mozzarella, provolone, parmesano y roquefort', 
            'price': Decimal('13.99'), 
            'category': pizzas
        },
        
        # Parrilla
        {
            'name': 'Bife de Chorizo', 
            'description': 'Corte de carne premium a la parrilla con guarnición', 
            'price': Decimal('16.99'), 
            'category': parrilla,
            'is_featured': True
        },
        {
            'name': 'Costillas BBQ', 
            'description': 'Costillas de cerdo con salsa barbacoa casera', 
            'price': Decimal('15.50'), 
            'category': parrilla
        },
        {
            'name': 'Parrillada para 2', 
            'description': 'Surtido de cortes de carne a la parrilla con chimichurri y papas', 
            'price': Decimal('28.99'), 
            'category': parrilla
        }
    ]
    
    for item_data in menu_items:
        menu_item, created = MenuItem.objects.get_or_create(
            name=item_data['name'],
            defaults={
                'description': item_data['description'],
                'price': item_data['price'],
                'category': item_data['category'],
                'is_featured': item_data.get('is_featured', False),
                'preparation_time': random.randint(10, 30)
            }
        )
        if created:
            print(f"Ítem del menú creado: {menu_item.name}")


def create_sample_orders():
    """Crear pedidos de ejemplo"""
    
    # Solo crear si hay menos de 5 pedidos
    if Order.objects.count() < 5:
        try:
            client = User.objects.get(email='cliente@ejemplo.com')
            
            # Estados de pedido para ejemplos
            status_options = ['pendiente', 'confirmado', 'en_preparacion', 'en_camino', 'entregado']
            payment_methods = ['efectivo', 'tarjeta', 'transferencia']
            
            # Crear varios pedidos con diferentes estados
            for i in range(5):
                order = Order.objects.create(
                    user=client,
                    total_amount=Decimal(random.uniform(20, 60)).quantize(Decimal('0.01')),
                    delivery_address='Calle Principal 123, Ciudad',
                    payment_method=random.choice(payment_methods),
                    status=status_options[i],  # Cada pedido con un estado diferente
                    notes=f'Pedido de prueba #{i+1}' if i % 2 == 0 else ''
                )
                
                # Agregar ítems aleatorios al pedido
                menu_items = list(MenuItem.objects.all())
                random.shuffle(menu_items)
                
                # Seleccionar 2-4 ítems aleatorios
                selected_items = menu_items[:random.randint(2, 4)]
                
                for item in selected_items:
                    quantity = random.randint(1, 3)
                    OrderItem.objects.create(
                        order=order,
                        menu_item=item,
                        quantity=quantity,
                        price=item.price
                    )
                
                print(f"Pedido de muestra creado: {order.order_code}")
        
        except User.DoesNotExist:
            print("No se pudo crear pedido: usuario cliente no encontrado")


if __name__ == '__main__':
    print("Cargando datos de prueba para Sabores Caseros...")
    create_test_users()
    create_menu_items()
    create_sample_orders()
    print("Datos de prueba cargados exitosamente.")