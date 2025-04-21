from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, MpesaWebhookView, DashboardView, ReportView

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
    path('mpesa-webhook/', MpesaWebhookView.as_view(), name='mpesa-webhook'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('reports/', ReportView.as_view(), name='reports'),
]
