"""
Test Storage Function
Verifies that in-memory storage is working correctly.
"""

import json
import logging
import sys
import os
import azure.functions as func

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from shared.storage import get_storage, get_questions, get_all_responses, get_sentiment_summary

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Test storage function triggered')
    
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    }
    
    try:
        # Get current storage state
        storage = get_storage()
        questions = get_questions()
        responses = get_all_responses()
        summary = get_sentiment_summary()
        
        result = {
            "status": "healthy",
            "storage_type": "in-memory (POC demo)",
            "questions_count": len(questions),
            "participants_count": len(storage.get("participants", [])),
            "responses_count": len(responses),
            "sentiment_summary": summary,
            "note": "Data is stored in memory and resets on cold start. For production, use GitHub Actions deployment for proper database connectivity."
        }
        
        return func.HttpResponse(
            json.dumps(result, indent=2),
            mimetype="application/json",
            status_code=200,
            headers=headers
        )
        
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"status": "error", "error": str(e)}),
            mimetype="application/json",
            status_code=500,
            headers=headers
        )
