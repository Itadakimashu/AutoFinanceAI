from django_filters.rest_framework import FilterSet
from django_filters import DateFromToRangeFilter
from .models import Transaction


class TransactionFilters(FilterSet):
    date = DateFromToRangeFilter()
    class Meta:
        model = Transaction
        fields = {
            'category': ['exact'],
            'amount': ['gte', 'lte'],
        }

