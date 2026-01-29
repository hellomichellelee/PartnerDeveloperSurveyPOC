"""
GetResponses Azure Function
Retrieves processed survey responses for dashboard/export.
"""

import json
import logging
import os

import azure.functions as func

# Try to import database helper
try:
    from ..shared.database import DatabaseHelper
    DB_AVAILABLE = True
except ImportError:
    DB_AVAILABLE = False


def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    HTTP trigger function to retrieve survey responses.
    
    Query parameters:
    - limit: Maximum number of responses to return (default: 100)
    - offset: Number of responses to skip (default: 0)
    - processed: Filter by processed status (true/false)
    """
    logging.info('GetResponses function triggered')

    try:
        # Parse query parameters
        limit = int(req.params.get('limit', 100))
        offset = int(req.params.get('offset', 0))
        processed_filter = req.params.get('processed')

        # Validate parameters
        limit = min(max(1, limit), 1000)  # Between 1 and 1000
        offset = max(0, offset)

        if not DB_AVAILABLE:
            return func.HttpResponse(
                json.dumps({
                    "success": True,
                    "data": [],
                    "total": 0,
                    "message": "Database not configured"
                }),
                status_code=200,
                mimetype="application/json",
                headers={"Access-Control-Allow-Origin": "*"}
            )

        db = DatabaseHelper()
        
        # Build query filters
        filters = {}
        if processed_filter is not None:
            filters['processed'] = processed_filter.lower() == 'true'

        # Get responses
        responses = db.get_responses(limit=limit, offset=offset, filters=filters)
        total_count = db.get_response_count(filters=filters)

        return func.HttpResponse(
            json.dumps({
                "success": True,
                "data": responses,
                "total": total_count,
                "limit": limit,
                "offset": offset
            }),
            status_code=200,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

    except ValueError as e:
        logging.error(f"Invalid parameter: {e}")
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "error": "Invalid query parameters"
            }),
            status_code=400,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )
    except Exception as e:
        logging.error(f"Error retrieving responses: {e}")
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "error": "Internal server error"
            }),
            status_code=500,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )
