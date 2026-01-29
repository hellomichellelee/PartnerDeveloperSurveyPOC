"""
ProcessResponses Function
In the mock version, sentiment is analyzed automatically on submission.
This endpoint returns a summary of the processing status.
For production, implement Azure AI Language integration via GitHub Actions deployment.
"""

import json
import logging
import sys
import os
import azure.functions as func

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from shared.storage import get_all_responses, get_sentiment_summary

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('ProcessResponses function triggered')
    
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }
    
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=headers)
    
    try:
        # In the mock version, all responses are automatically processed
        # when submitted using the keyword-based sentiment analyzer
        
        all_responses = get_all_responses()
        summary = get_sentiment_summary()
        
        result = {
            "processed": len(all_responses),
            "pending": 0,
            "message": "All responses are automatically processed with mock sentiment analysis",
            "summary": summary,
            "note": "For production, deploy with GitHub Actions to enable Azure AI Language integration"
        }
        
        return func.HttpResponse(
            json.dumps(result),
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
