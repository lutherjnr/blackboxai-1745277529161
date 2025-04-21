from rest_framework import viewsets, status, generics, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Sum
from .models import User, Account, Transaction
from .serializers import UserSerializer, AccountSerializer, TransactionSerializer
from .permissions import IsAdminUser, IsFinanceUser
from .tasks import send_sms_task
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from django.conf import settings
from datetime import datetime

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class AccountViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-timestamp')
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['account__code', 'timestamp', 'phone', 'name']
    search_fields = ['phone', 'name']

    def get_permissions(self):
        if self.action == 'create_manual':
            return [IsFinanceUser()]
        return super().get_permissions()

    @action(detail=False, methods=['post'], url_path='manual', permission_classes=[IsFinanceUser])
    def create_manual(self, request):
        """
        Manual payment entry by finance team.
        """
        serializer = TransactionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(is_manual=True)
            # Send SMS notification asynchronously
            phone = serializer.validated_data['phone']
            name = serializer.validated_data['name']
            amount = serializer.validated_data['amount']
            account = serializer.validated_data['account']
            message = f"Dear {name}, your payment of {amount} to {account.name} has been recorded. Thank you."
            send_sms_task.delay(phone, message)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class MpesaWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """
        Handle M-Pesa Daraja API payment callback webhook.
        """
        try:
            data = json.loads(request.body)
            # Parse required fields from callback data
            # This depends on M-Pesa callback structure; example below:
            result = data.get('Body', {}).get('stkCallback', {})
            if not result:
                return Response({"error": "Invalid callback data"}, status=status.HTTP_400_BAD_REQUEST)

            callback_metadata = result.get('CallbackMetadata', {})
            items = callback_metadata.get('Item', [])

            # Extract needed info
            amount = None
            phone = None
            timestamp = timezone.now()
            name = "Unknown"
            account_code = None

            for item in items:
                name_key = item.get('Name')
                if name_key == 'Amount':
                    amount = item.get('Value')
                elif name_key == 'PhoneNumber':
                    phone = str(item.get('Value'))
                elif name_key == 'MpesaReceiptNumber':
                    pass  # can be stored if needed
                elif name_key == 'TransactionDate':
                    # Convert to datetime
                    dt_str = str(item.get('Value'))
                    timestamp = datetime.strptime(dt_str, '%Y%m%d%H%M%S')
                elif name_key == 'AccountReference':
                    account_code = item.get('Value')

            if not all([amount, phone, account_code]):
                return Response({"error": "Missing required payment data"}, status=status.HTTP_400_BAD_REQUEST)

            # Find account by code
            try:
                account = Account.objects.get(code=account_code)
            except Account.DoesNotExist:
                return Response({"error": "Invalid account code"}, status=status.HTTP_400_BAD_REQUEST)

            # Save transaction
            transaction = Transaction.objects.create(
                name=name,
                phone=phone,
                amount=amount,
                timestamp=timestamp,
                account=account,
                is_manual=False
            )

            # Send SMS notification asynchronously
            message = f"Dear {phone}, your payment of {amount} to {account.name} has been received. Thank you."
            send_sms_task.delay(phone, message)

            return Response({"status": "success"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        """
        Return summary cards and trends for dashboard.
        """
        # Total income per account
        totals = Transaction.objects.values('account__code', 'account__name').annotate(total_amount=Sum('amount'))

        # Prepare data for charts (example: total per account)
        data = {
            'totals': list(totals),
        }
        return Response(data)

class ReportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        """
        Generate reports filtered by member, account, or date range.
        """
        account_code = request.query_params.get('account')
        phone = request.query_params.get('phone')
        name = request.query_params.get('name')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        transactions = Transaction.objects.all()

        if account_code:
            transactions = transactions.filter(account__code=account_code)
        if phone:
            transactions = transactions.filter(phone__icontains=phone)
        if name:
            transactions = transactions.filter(name__icontains=name)
        if start_date:
            transactions = transactions.filter(timestamp__gte=start_date)
        if end_date:
            transactions = transactions.filter(timestamp__lte=end_date)

        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)
