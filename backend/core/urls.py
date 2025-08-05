from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    TransactionViewSet, 
    ImageToTransactionViewSet,
    AnalysisView,
    TransactionPDFView,

    #function based views
    user_update,
)

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'image-to-trasaction', ImageToTransactionViewSet, basename='image-to-text')

urlpatterns = [
    path('', include(router.urls)),
    path('analysis/', AnalysisView.as_view(), name='analysis'),
    path('user/update/', user_update, name='user-update'),
    path('transactions/pdf/download/', TransactionPDFView.as_view(), name='transaction-pdf'),
] 