from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import TransactionViewSet, ImageToTransactionViewSet,AnalysisView

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'image-to-trasaction', ImageToTransactionViewSet, basename='image-to-text')

urlpatterns = [
    path('', include(router.urls)),
    path('analysis/', AnalysisView.as_view(), name='analysis'),

] 