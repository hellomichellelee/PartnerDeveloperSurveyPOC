"""
Health Check Function - Simple endpoint to verify API is working.
"""

import json
import os
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    # Return basic health check info
    return func.HttpResponse(
        json.dumps({
            "status": "healthy",
            "environment": {
                "sql_configured": bool(os.environ.get('AZURE_SQL_CONNECTION_STRING')),
                "language_configured": bool(os.environ.get('AZURE_LANGUAGE_ENDPOINT')),
                "speech_configured": bool(os.environ.get('AZURE_SPEECH_KEY'))
            }
        }),
        status_code=200,
        headers={"Content-Type": "application/json"}
    )
