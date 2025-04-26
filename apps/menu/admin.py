from django.contrib import admin
from .models import Category, MenuItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'is_available', 'is_featured')
    list_filter = ('is_available', 'is_featured', 'category')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('is_available', 'is_featured', 'price')