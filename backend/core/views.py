from django.shortcuts import render

from rest_framework import viewsets

from .models import Transaction
from .serializers import (
    TransactionSerializer ,
    TransactionViewSerializer, 
    TransactionCreateSerializer,
    TransactionUpdateSerializer
)

# Create your views here.

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