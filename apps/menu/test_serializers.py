from decimal import Decimal
from django.test import TestCase
from apps.menu.models import Category, MenuItem
from apps.menu.serializers import CategorySerializer, MenuItemSerializer

class CategorySerializerTest(TestCase):
    def test_category_serialization(self):
        category = Category.objects.create(
            name="Bebidas",
            description="Bebidas frías y calientes",
            is_active=True
        )
        serializer = CategorySerializer(category)
        data = serializer.data
        self.assertEqual(data['name'], "Bebidas")
        self.assertEqual(data['description'], "Bebidas frías y calientes")
        self.assertTrue(data['is_active'])

    def test_category_deserialization_and_creation(self):
        data = {
            'name': "Sopas",
            'description': "Sopas calientes",
            'is_active': True,
        }
        serializer = CategorySerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        category = serializer.save()
        self.assertEqual(category.name, "Sopas")
        self.assertEqual(category.description, "Sopas calientes")
        self.assertTrue(category.is_active)


class MenuItemSerializerTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Postres")

    def test_menuitem_serialization(self):
        menu_item = MenuItem.objects.create(
            name="Tarta",
            description="Tarta de manzana",
            price=Decimal('3500.50'),
            category=self.category,
            preparation_time=30,
            is_available=True,
            is_featured=False
        )
        serializer = MenuItemSerializer(menu_item)
        data = serializer.data
        
        self.assertEqual(data['name'], "Tarta")
        self.assertEqual(data['description'], "Tarta de manzana")
        self.assertEqual(data['category'], self.category.id)
        self.assertEqual(data['category_name'], "Postres")
        self.assertEqual(data['price'], 3500.50)  # decimal no string
        self.assertTrue(data['is_available'])
        self.assertFalse(data['is_featured'])
        self.assertEqual(data['preparation_time'], 30)

    def test_menuitem_deserialization_and_creation(self):
        data = {
            'name': "Helado",
            'description': "Helado de vainilla",
            'price': '2500.75',
            'category': self.category.id,
            'preparation_time': 15,
            'is_available': True,
            'is_featured': True
        }
        serializer = MenuItemSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        menu_item = serializer.save()
        self.assertEqual(menu_item.name, "Helado")
        self.assertEqual(menu_item.price, Decimal('2500.75'))
        self.assertEqual(menu_item.category, self.category)
        self.assertTrue(menu_item.is_featured)

    def test_menuitem_invalid_price(self):
        data = {
            'name': "Invalid Price Item",
            'description': "Debe fallar",
            'price': 'no-es-numero',
            'category': self.category.id,
            'preparation_time': 10,
            'is_available': True,
            'is_featured': False
        }
        serializer = MenuItemSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('price', serializer.errors)
