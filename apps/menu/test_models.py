from django.test import TestCase
from apps.menu.models import Category, MenuItem

class CategoryModelTest(TestCase):

    def test_create_category_with_all_fields(self):
        category = Category.objects.create(
            name="Entradas",
            description="Entradas deliciosas",
            is_active=True
        )
        self.assertEqual(category.name, "Entradas")
        self.assertEqual(category.description, "Entradas deliciosas")
        self.assertTrue(category.is_active)
        self.assertIsNotNone(category.created_at)
        self.assertIsNotNone(category.updated_at)
        self.assertEqual(str(category), "Entradas")

    def test_create_category_default_values(self):
        category = Category.objects.create(
            name="Principales"
        )
        self.assertEqual(category.description, None)
        self.assertTrue(category.is_active)

    def test_category_ordering(self):
        Category.objects.create(name="Bebidas")
        Category.objects.create(name="Entradas")
        categories = Category.objects.all()
        names = [c.name for c in categories]
        self.assertEqual(names, sorted(names))  # ordering by name

class MenuItemModelTest(TestCase):

    def test_create_menu_item_with_all_fields(self):
        category = Category.objects.create(name="Postres")
        menu_item = MenuItem.objects.create(
            name="Pastel de chocolate",
            description="Pastel húmedo de chocolate",
            price=5000.00,
            category=category,
            preparation_time=20,
            is_featured=True,
            is_available=True
        )
        self.assertEqual(menu_item.name, "Pastel de chocolate")
        self.assertEqual(menu_item.description, "Pastel húmedo de chocolate")
        self.assertEqual(menu_item.price, 5000.00)
        self.assertEqual(menu_item.category, category)
        self.assertTrue(menu_item.is_available)
        self.assertTrue(menu_item.is_featured)
        self.assertEqual(menu_item.preparation_time, 20)
        self.assertIsNotNone(menu_item.created_at)
        self.assertIsNotNone(menu_item.updated_at)
        self.assertEqual(str(menu_item), "Pastel de chocolate")

    def test_create_menu_item_default_values(self):
        category = Category.objects.create(name="Bebidas")
        menu_item = MenuItem.objects.create(
            name="Agua Mineral",
            description="Botella de agua con gas",
            price=2000.00,
            category=category
        )
        self.assertTrue(menu_item.is_available)
        self.assertFalse(menu_item.is_featured)
        self.assertEqual(menu_item.preparation_time, 15)  # valor por defecto

    def test_menu_item_ordering(self):
        cat1 = Category.objects.create(name="Bebidas")
        MenuItem.objects.create(name="Zumo de naranja", description="Natural", price=4000.00, category=cat1)
        MenuItem.objects.create(name="Agua Mineral", description="Con gas", price=3000.00, category=cat1)
        menu_items = MenuItem.objects.all()
        names = [item.name for item in menu_items]
        self.assertEqual(names, sorted(names))  # ordering by name
