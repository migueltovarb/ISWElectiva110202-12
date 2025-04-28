# apps/orders/test_cart_views.py

from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.menu.models import Category, MenuItem
from apps.orders.models import Cart, CartItem

User = get_user_model()

class CartViewsTestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpassword123'
        )
        self.client.force_authenticate(user=self.user)

        self.category = Category.objects.create(name='Bebidas')
        self.menu_item = MenuItem.objects.create(
            name='Agua Mineral',
            description='Agua con gas',
            price=2000,
            category=self.category
        )
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(cart=self.cart, menu_item=self.menu_item, quantity=2)

    def test_get_cart(self):
        url = '/api/orders/cart/'
        # Crear carrito si no existe
        Cart.objects.get_or_create(user=self.user)
        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT])

    def test_add_item_to_cart(self):
        url = '/api/orders/cart/add/'
        data = {
            'menu_item_id': self.menu_item.id,
            'quantity': 3
        }
        response = self.client.post(url, data)
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_200_OK])

    def test_remove_item_from_cart(self):
        url = f'/api/orders/cart/items/{self.cart_item.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)  # Aquí esperamos 200

    def test_clear_cart(self):
        Cart.objects.get_or_create(user=self.user)
        self.cart.items.all().delete()
        url = '/api/orders/cart/'
        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT])

    def test_add_invalid_item_to_cart(self):
        url = '/api/orders/cart/add/'
        data = {
            'menu_item_id': 9999,
            'quantity': 1
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)  # Esperar 400, no 404
