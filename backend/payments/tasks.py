import requests
from celery import shared_task
from django.conf import settings
from .models import SMSLog

@shared_task
def send_sms_task(phone, message):
    """
    Send SMS via HostPinnacle API asynchronously.
    """
    url = settings.HOSTPINNACLE_API_URL
    api_key = settings.HOSTPINNACLE_API_KEY
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    payload = {
        'to': phone,
        'message': message,
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        success = response.status_code == 200
        response_text = response.text
    except Exception as e:
        success = False
        response_text = str(e)

    SMSLog.objects.create(
        phone=phone,
        message=message,
        success=success,
        response=response_text
    )
    return success
