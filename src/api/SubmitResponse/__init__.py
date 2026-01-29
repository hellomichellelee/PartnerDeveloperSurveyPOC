"""
SubmitResponse Function
Receives survey submissions from the frontend and saves to in-memory storage.
For production, implement proper database connectivity via GitHub Actions deployment.
"""

import json
import logging
import sys
import os
import azure.functions as func

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from shared.storage import add_participant, add_response

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('SubmitResponse function triggered')
    
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }
    
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=headers)
    
    try:
        req_body = req.get_json()
        logging.info(f"Received submission: {req_body.get('submissionId', 'unknown')}")
        
        submission_id = req_body.get('submissionId')
        participant = req_body.get('participant', {})
        responses = req_body.get('responses', [])
        
        if not submission_id:
            return func.HttpResponse(
                json.dumps({"error": "submissionId is required"}),
                status_code=400,
                headers=headers
            )
        
        if not participant.get('firstName') or not participant.get('lastName') or not participant.get('email'):
            return func.HttpResponse(
                json.dumps({"error": "participant firstName, lastName, and email are required"}),
                status_code=400,
                headers=headers
            )
        
        if not responses:
            return func.HttpResponse(
                json.dumps({"error": "At least one response is required"}),
                status_code=400,
                headers=headers
            )
        
        # Add participant
        add_participant(
            submission_id=submission_id,
            first_name=participant.get('firstName'),
            last_name=participant.get('lastName'),
            email=participant.get('email')
        )
        
        # Add responses (with automatic mock sentiment analysis)
        for response in responses:
            add_response(
                submission_id=submission_id,
                question_id=response.get('questionId', 0),
                question_text=response.get('questionText', ''),
                response_text=response.get('responseText', ''),
                input_method=response.get('inputMethod', 'text')
            )
        
        result = {
            "success": True,
            "submissionId": submission_id,
            "responsesCount": len(responses),
            "message": "Survey submitted successfully"
        }
        
        return func.HttpResponse(
            json.dumps(result),
            status_code=200,
            headers=headers
        )
        
    except ValueError as ve:
        logging.error(f"JSON parsing error: {str(ve)}")
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON in request body"}),
            status_code=400,
            headers=headers
        )
    except Exception as e:
        logging.error(f"Error processing submission: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            headers=headers
        )
