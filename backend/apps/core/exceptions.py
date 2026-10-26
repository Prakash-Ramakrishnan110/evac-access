from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    Standardized REST API error response handler:
    {
        "code": "VALIDATION_ERROR" | "PERMISSION_DENIED" | "NOT_FOUND" | "SERVER_ERROR",
        "message": "Human readable explanation",
        "field_errors": { "field": ["Error detail"] }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_code = "API_ERROR"
        message = "An error occurred while processing the request."
        field_errors = {}

        if response.status_code == status.HTTP_400_BAD_REQUEST:
            error_code = "VALIDATION_ERROR"
            message = "Validation failed for one or more fields."
            if isinstance(response.data, dict):
                field_errors = response.data
            elif isinstance(response.data, list):
                field_errors = {"non_field_errors": response.data}
        elif response.status_code == status.HTTP_401_UNAUTHORIZED:
            error_code = "UNAUTHORIZED"
            message = "Authentication credentials were not provided or are invalid."
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            error_code = "PERMISSION_DENIED"
            message = "You do not have permission to perform this action."
        elif response.status_code == status.HTTP_404_NOT_FOUND:
            error_code = "NOT_FOUND"
            message = "The requested resource was not found."
        
        response.data = {
            "code": error_code,
            "message": response.data.get("detail", message) if isinstance(response.data, dict) else message,
            "field_errors": field_errors,
        }

    return response
