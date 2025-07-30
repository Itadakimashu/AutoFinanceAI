from datetime import date as dt

from django.shortcuts import render
from django.db.models import Sum, Count, Q
from django.conf import settings

from rest_framework import viewsets
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from rest_framework.decorators import action

from django_filters.rest_framework import DjangoFilterBackend


from .models import Transaction, TransactionImage
from .serializers import (
    TransactionSerializer ,
    TransactionViewSerializer, 
    TransactionCreateSerializer,
    TransactionUpdateSerializer,
    TransactionImageSerializer
)
from .filters import TransactionFilters
from .pagination import DefaultPagination
from . image_to_transaction import image_to_transaction

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
    
class ImageToTransactionViewSet(viewsets.ModelViewSet):
    queryset = TransactionImage.objects.all()
    serializer_class = TransactionImageSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({"error": "No image file provided."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check file size limit (5MB)
        if image_file.size > 5 * 1024 * 1024:
            return Response({"error": "Image file size exceeds 5MB limit."}, status=status.HTTP_400_BAD_REQUEST)
        api_key = settings.GEMINI_API_KEY
        try:
            image_bytes = image_file.read()
            transactions_data = image_to_transaction(image_bytes, api_key)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        if not transactions_data:
            return Response({"error": "Failed to extract transactions from image."}, status=status.HTTP_400_BAD_REQUEST)
        

        transactions = []
        for transaction_data in transactions_data:
            try:
                # Ensure required fields have values
                description = transaction_data.get('description', 'Unknown transaction')
                amount = transaction_data.get('amount', 0)
                date = transaction_data.get('date', dt.today())
                category = transaction_data.get('category', 'miscellaneous')
                
                
                # Create Transaction instance without saving to database
                transaction = Transaction(
                    user=request.user,
                    description=description,
                    amount=amount,
                    date=date,
                    category=category,
                )
                transactions.append(transaction)
            except Exception as e:
                # Log the error but continue with other transactions
                print(f"Error creating transaction: {e}")
                continue

        # Serialize the transactions for JSON response
        serializer = TransactionViewSerializer(transactions, many=True)
        return Response({
            "success": True,
            "message": f"Extracted {len(transactions)} transactions from image",
            "transactions": serializer.data
        }, status=status.HTTP_200_OK)

  
