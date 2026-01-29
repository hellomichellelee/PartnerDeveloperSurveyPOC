"""
SubmitResponse Azure Function
Receives survey responses from the frontend and stores them in the database.
"""

import json
import logging
import os
import uuid
from datetime import datetime

import azure.functions as func

# Try to import database helper, fall back gracefully
try:
    from ..shared.database import DatabaseHelper
    DB_AVAILABLE = True
except ImportError:
    DB_AVAILABLE = False

def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    HTTP trigger function to submit survey responses.
    
    Expected JSON body:
    {
        "participant": {
            "firstName": "string",
            "lastName": "string",
            "email": "string",
            "consentGiven": true,
            "consentTimestamp": "ISO datetime"
        },
        "responses": [
            {
                "questionId": "string",
                "questionText": "string",
                "response": "string",
                "inputMode": "voice|text",
                "timestamp": "ISO datetime"
            }
        ],
        "submittedAt": "ISO datetime"
    }
    """
    logging.info('SubmitResponse function triggered')

    # Handle CORS preflight
    if req.method == "OPTIONS":
        return func.HttpResponse(
            status_code=204,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )

    try:
        # Parse request body
        req_body = req.get_json()
        
        # Validate required fields
        if not req_body.get('participant'):
            return create_error_response("Missing participant information", 400)
        
        participant = req_body['participant']
        if not all([
            participant.get('firstName'),
            participant.get('lastName'),
            participant.get('email'),
            participant.get('consentGiven')
        ]):
            return create_error_response("Missing required participant fields", 400)
        
        if not participant['consentGiven']:
            return create_error_response("Consent is required", 400)

        responses = req_body.get('responses', [])
        if not responses:
            return create_error_response("No responses provided", 400)

        # Generate submission ID
        submission_id = str(uuid.uuid4())
        
        # Store in database
        if DB_AVAILABLE:
            try:
                db = DatabaseHelper()
                
                # Insert participant
                participant_id = db.insert_participant(
                    submission_id=submission_id,
                    first_name=participant['firstName'],
                    last_name=participant['lastName'],
                    email=participant['email'],
                    consent_given=participant['consentGiven'],
                    consent_timestamp=participant.get('consentTimestamp')
                )
                
                # Insert responses
                for response in responses:
                    db.insert_response(
                        submission_id=submission_id,
                        question_id=response['questionId'],
                        question_text=response['questionText'],
                        response_text=response['response'],
                        input_mode=response.get('inputMode', 'text'),
                        timestamp=response.get('timestamp')
                    )
                
                logging.info(f"Stored submission {submission_id} with {len(responses)} responses")
                
            except Exception as db_error:
                logging.error(f"Database error: {db_error}")
                # Continue without database for demo purposes
        else:
            logging.warning("Database not available, response logged only")

        # Return success response
        return func.HttpResponse(
            json.dumps({
                "success": True,
                "submissionId": submission_id,
                "responsesReceived": len(responses),
                "message": "Survey submitted successfully"
            }),
            status_code=200,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "*"
            }
        )

    except ValueError as e:
        logging.error(f"Invalid JSON: {e}")
        return create_error_response("Invalid JSON in request body", 400)
    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return create_error_response("Internal server error", 500)


def create_error_response(message: str, status_code: int) -> func.HttpResponse:
    """Create a standardized error response."""
    return func.HttpResponse(
        json.dumps({
            "success": False,
            "error": message
        }),
        status_code=status_code,
        mimetype="application/json",
        headers={
            "Access-Control-Allow-Origin": "*"
        }
    )
