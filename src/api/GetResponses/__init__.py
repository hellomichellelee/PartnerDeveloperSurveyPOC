"""
GetResponses Function
Retrieves survey responses from in-memory storage.
For production, implement proper database connectivity via GitHub Actions deployment.
"""

import json
import logging
import sys
import os
import azure.functions as func

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from shared.storage import get_all_responses

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('GetResponses function triggered')
    
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }
    
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=headers)
    
    try:
        question_id = req.params.get('questionId')
        processed_only = req.params.get('processedOnly', 'false').lower() == 'true'
        limit = int(req.params.get('limit', '100'))
        
        # Get all responses from in-memory storage
        all_responses = get_all_responses()
        
        # Filter by question_id if provided
        if question_id:
            all_responses = [r for r in all_responses if str(r.get('question_id')) == str(question_id)]
        
        # Filter by processed if requested
        if processed_only:
            all_responses = [r for r in all_responses if r.get('processed', False)]
        
        # Apply limit
        results = all_responses[:limit]
        
        return func.HttpResponse(
            json.dumps({"responses": results, "count": len(results)}),
            status_code=200,
            headers=headers
        )
        
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            headers=headers
        )
