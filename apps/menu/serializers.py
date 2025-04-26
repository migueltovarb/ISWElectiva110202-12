from rest_framework import serializers
from .models import Category, MenuItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'image', 'is_active')


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)  # 👈 Aquí lo añadimos

    
    class Meta:
        model = MenuItem
        fields = (
            'id', 'name', 'description', 'price', 'image', 'category', 
            'category_name', 'is_available', 'is_featured', 'preparation_time'
        )