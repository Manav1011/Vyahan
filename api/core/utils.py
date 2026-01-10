from rest_framework.response import Response

def response(status_code, message, data=None, error=None):
    resp = {
        'status_code': status_code,
        'message': message,
        'data': data,
        'error': error,
    }
    return Response(resp, status=status_code)