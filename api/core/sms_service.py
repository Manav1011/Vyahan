import requests
import logging

logger = logging.getLogger(__name__)

SMS_GATEWAY_URL = "https://sms-gateway.mnv-dev.site/send_sms"

def send_sms(to_number, message_body):
    """
    Sends an SMS using the external SMS gateway.
    """
    try:
        # The user's example showed passing data in 'params', which sends them as query parameters.
        # usually POST requests send data in body, but the user example explicitly used `params=...`
        # with a POST request. We will follow the user's verified example.
        response = requests.post(
            SMS_GATEWAY_URL,
            params={
                "to": to_number,
                "message": message_body
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        logger.info(f"SMS sent successfully to {to_number}: {data}")
        return True, data
    except requests.RequestException as e:
        logger.error(f"Failed to send SMS to {to_number}: {str(e)}")
        try:
             if e.response:
                 logger.error(f"Gateway Response: {e.response.text}")
        except:
            pass
        return False, str(e)
