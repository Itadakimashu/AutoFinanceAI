from django.shortcuts import render

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.filters import SearchFilter, OrderingFilter

from django_filters.rest_framework import DjangoFilterBackend


from .models import Transaction
from .serializers import (
    TransactionSerializer ,
    TransactionViewSerializer, 
    TransactionCreateSerializer,
    TransactionUpdateSerializer
)
from .filters import TransactionFilters
from .pagination import DefaultPagination

# Create your views here.

class TransactionViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'patch', 'delete']
    filter_backends = [DjangoFilterBackend,SearchFilter, OrderingFilter]
    search_fields = ['description']
    ordering_fields = ['amount', 'date']
    filterset_class = TransactionFilters
    pagination_class = DefaultPagination



    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TransactionCreateSerializer
        elif self.request.method == 'GET':
            return TransactionViewSerializer
        elif self.request.method == 'PATCH':
            return TransactionUpdateSerializer
        else:
            return TransactionSerializer
        
    def get_permissions(self):
        if self.request.method in ['GET','POST', 'PATCH','DELETE']:
            return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user is IsAdminUser:
            return Transaction.objects.all()
        elif user.is_authenticated:
            return Transaction.objects.filter(user=user)
    
    
