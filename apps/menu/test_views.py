from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.menu.models import Category, MenuItem

class CategoryListViewTest(APITestCase):
    def test_list_categories(self):
        Category.objects.create(name="Entradas", description="Platos de entrada")
        url = reverse('menu:category-list')
        response = self.client.get(url)
        print(f"CategoryListViewTest response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)


class MenuItemListViewTest(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Postres")
        self.item1 = MenuItem.objects.create(
            name="Pastel",
            description="Pastel de chocolate",
            price=5000,
            category=self.category,
            preparation_time=20,
            is_available=True,
            is_featured=True
        )
        self.item2 = MenuItem.objects.create(
            name="Helado",
            description="Helado de vainilla",
            price=3000,
            category=self.category,
            preparation_time=10,
            is_available=False,
            is_featured=False
        )

    def test_list_menu_items(self):
        url = reverse('menu:menuitem-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 1)

    def test_filter_featured_items(self):
        url = reverse('menu:menuitem-list') + '?featured=true'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for item in response.data['results']:
            self.assertTrue(item['is_featured'])

    def test_filter_available_items(self):
        url = reverse('menu:menuitem-list') + '?available=true'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for item in response.data['results']:
            self.assertTrue(item['is_available'])

    def test_search_menu_items(self):
        url = reverse('menu:menuitem-list') + '?search=Pastel'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for item in response.data['results']:
            self.assertIn('Pastel', item['name'])

class MenuItemDetailViewTest(APITestCase):
    def test_get_menu_item_detail(self):
        category = Category.objects.create(name="Bebidas")
        menu_item = MenuItem.objects.create(
            name="Café",
            description="Café negro",
            price=2000,
            category=category,
            preparation_time=5
        )
        url = reverse('menu:menuitem-detail', args=[menu_item.id])
        response = self.client.get(url)
        print(f"MenuItemDetailViewTest response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Café")


class FeaturedMenuItemsViewTest(APITestCase):
    def test_list_featured_menu_items(self):
        category = Category.objects.create(name="Entradas")
        MenuItem.objects.create(
            name="Bruschetta",
            description="Pan tostado con tomate",
            price=4000,
            category=category,
            preparation_time=15,
            is_featured=True,
            is_available=True
        )
        url = reverse('menu:featured-items')
        response = self.client.get(url)
        print(f"FeaturedMenuItemsViewTest status: {response.status_code}, data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
