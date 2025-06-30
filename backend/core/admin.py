from django.contrib import admin

from .models import Category, Transaction

# Register your models here.
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'description', 'amount', 'category', 'is_income', 'is_recurring')
    list_filter = ('date', 'is_income', 'is_recurring')
    search_fields = ('description',)
    ordering = ('-date',)

