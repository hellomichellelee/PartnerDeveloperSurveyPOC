"""
SubmitResponse Function
Receives survey submissions from the frontend.
Uses Azure SQL Database when available (via GitHub Actions deployment),
falls back to in-memory storage otherwise.
"""

import json
import logging
import sys
import os
import azure.functions as func

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from shared.storage import add_participant, add_response
from shared.database import is_database_available, get_connection


def save_to_database(submission_id: str, participant: dict, responses: list) -> bool:
    """Save submission to Azure SQL Database."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Insert participant (skip if already exists from a previous topic submission)
        cursor.execute(
            "SELECT 1 FROM participants WHERE submission_id = %s",
            (submission_id,)
        )
        if cursor.fetchone() is None:
            cursor.execute(
                """INSERT INTO participants 
                   (submission_id, first_name, last_name, email, company, consent_given, consent_timestamp) 
                   VALUES (%s, %s, %s, %s, %s, 1, GETUTCDATE())""",
                (submission_id, participant.get('firstName'), 
                 participant.get('lastName'), participant.get('email'),
                 participant.get('company'))
            )
        
        # Insert responses
        for response in responses:
            cursor.execute(
                """INSERT INTO responses 
                   (submission_id, topic, question_id, question_text, response_text, input_method) 
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (submission_id, response.get('topic', ''),
                 response.get('questionId'), 
                 response.get('questionText', ''), response.get('responseText'),
                 response.get('inputMethod', 'text'))
            )
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        logging.error(f"Database save failed: {str(e)}")
        return False


def save_to_memory(submission_id: str, participant: dict, responses: list):
    """Save submission to in-memory storage (fallback)."""
    add_participant(
        submission_id=submission_id,
        first_name=participant.get('firstName'),
        last_name=participant.get('lastName'),
        email=participant.get('email'),
        company=participant.get('company')
    )
    
    for response in responses:
        add_response(
            submission_id=submission_id,
            question_id=response.get('questionId', 0),
            question_text=response.get('questionText', ''),
            response_text=response.get('responseText', ''),
            input_method=response.get('inputMethod', 'text'),
            topic=response.get('topic', '')
        )


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
        
        # Validation
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
        
        # Try database first, fall back to in-memory storage
        storage_type = "in-memory"
        if is_database_available():
            if save_to_database(submission_id, participant, responses):
                storage_type = "database"
            else:
                save_to_memory(submission_id, participant, responses)
        else:
            save_to_memory(submission_id, participant, responses)
        
        result = {
            "success": True,
            "submissionId": submission_id,
            "responsesCount": len(responses),
            "message": "Survey submitted successfully",
            "storageType": storage_type
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
