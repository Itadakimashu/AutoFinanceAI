from django.shortcuts import render

from rest_framework import viewsets

from .models import Category, Transaction
from .serializers import (
    CategorySerializer, 
    TransactionSerializer ,
    TransactionViewSerializer, 
    TransactionCreateSerializer,
    TransactionUpdateSerializer
)

# Create your views here.
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TransactionCreateSerializer
        elif self.request.method == 'GET':
            return TransactionViewSerializer
        elif self.request.method == 'PATCH':
            return TransactionUpdateSerializer
        else:
            return TransactionSerializer