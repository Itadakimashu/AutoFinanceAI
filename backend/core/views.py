from django.shortcuts import render
from django.db.models import Sum, Count, Q

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
from .Image_to_text import extract_text_from_image
from .transaction_parser import parse_transaction_from_text

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
    

class TransactionImageViewSet(viewsets.ModelViewSet):
    queryset = TransactionImage.objects.all()
    serializer_class = TransactionImageSerializer
    
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
        api_key = 'EqfrzG67AM+JNkZaZUL1Yg==UyZkDq1Z9QVueOAW'
        result = extract_text_from_image(image_file, api_key)
        if not result.get("success"):
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract text from the API response
        extracted_data = result.get("extracted_text", [])
        if isinstance(extracted_data, list):
            # Convert list of dicts to list of strings
            text_list = []
            for item in extracted_data:
                if isinstance(item, dict):
                    text_list.append(item.get('text', ''))
                else:
                    text_list.append(str(item))
        else:
            text_list = [str(extracted_data)]
        
        # Parse the extracted text into a transaction
        transactions_data = parse_transaction_from_text(text_list)
        if not transactions_data:
            return Response({"error": "Failed to parse transaction data."}, status=status.HTTP_400_BAD_REQUEST)
        
        transactions = []
        for transaction_data in transactions_data:
            try:
                # Ensure required fields have values
                description = transaction_data.get('description', 'Unknown transaction')
                amount = transaction_data.get('amount', 0)
                date = transaction_data.get('date')
                category = transaction_data.get('category', 'miscellaneous')
                
                # If no date is parsed, use today's date
                if not date:
                    from datetime import date as dt_date
                    date = dt_date.today()
                
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

  
