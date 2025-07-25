from django.contrib import admin

from .models import Transaction, TransactionImage

# Register your models here.


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'description', 'amount', 'category', 'is_recurring')
    list_filter = ('date' , 'is_recurring')
    search_fields = ('description',)
    ordering = ('-date',)

@admin.register(TransactionImage)
class TransactionImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'image')
    search_fields = ('image',)
    ordering = ('-id',)



