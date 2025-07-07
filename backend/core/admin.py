from django.contrib import admin

from .models import Transaction

# Register your models here.


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'description', 'amount', 'category', 'is_recurring')
    list_filter = ('date' , 'is_recurring')
    search_fields = ('description',)
    ordering = ('-date',)

