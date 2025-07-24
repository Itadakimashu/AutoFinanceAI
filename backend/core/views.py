from django.shortcuts import render
from django.db.models import Sum, Count, Q

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from rest_framework.decorators import action

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
        
    def get_permissions(self):
        if self.request.method in ['GET','POST', 'PATCH','DELETE']:
            return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Transaction.objects.all()
        elif user.is_authenticated:
            return Transaction.objects.filter(user=user)
    
    def list(self, request, *args, **kwargs):
        # Get the filtered queryset (before pagination)
        queryset = self.filter_queryset(self.get_queryset())
        
        # Calculate totals for the filtered data
        totals = queryset.aggregate(
            total_income=Sum('amount', filter=Q(category='income')),
            total_expenses=Sum('amount', filter=~Q(category='income')),
            total_amount=Sum('amount'),
            transaction_count=Count('id')
        )
        
        # Apply pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            
            # Add totals to the response
            response.data['totals'] = {
                'total_income': float(totals['total_income'] or 0),
                'total_expenses': float(totals['total_expenses'] or 0),
                'net_amount': float((totals['total_income'] or 0) - (totals['total_expenses'] or 0)),
                'total_transactions': totals['transaction_count']
            }
            return response
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    
