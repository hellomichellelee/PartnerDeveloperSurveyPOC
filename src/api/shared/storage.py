"""
In-Memory Storage for POC Demo
Simulates database storage when dependencies can't be installed.
"""

# In-memory storage (resets on function cold start)
_storage = {
    "participants": [],
    "responses": [],
    "questions": [
        {"id": 1, "text": "What features do you find most valuable in our product?", "category": "product"},
        {"id": 2, "text": "How would you describe your overall experience with our service?", "category": "experience"},
        {"id": 3, "text": "What improvements would you suggest for future updates?", "category": "feedback"},
        {"id": 4, "text": "How likely are you to recommend us to others and why?", "category": "nps"},
        {"id": 5, "text": "Please share any additional thoughts or comments.", "category": "general"}
    ]
}

def get_storage():
    """Get the in-memory storage"""
    return _storage

def add_participant(submission_id: str, first_name: str, last_name: str, email: str):
    """Add a participant to storage"""
    participant = {
        "submission_id": submission_id,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "consent_given": True
    }
    _storage["participants"].append(participant)
    return participant

def add_response(submission_id: str, question_id: int, question_text: str, response_text: str, input_method: str = "text"):
    """Add a response to storage"""
    response = {
        "submission_id": submission_id,
        "question_id": question_id,
        "question_text": question_text,
        "response_text": response_text,
        "input_method": input_method
    }
    _storage["responses"].append(response)
    return response

def get_all_responses():
    """Get all responses with participant info"""
    results = []
    for response in _storage["responses"]:
        participant = next((p for p in _storage["participants"] if p["submission_id"] == response["submission_id"]), None)
        result = {**response}
        if participant:
            result["first_name"] = participant["first_name"]
            result["last_name"] = participant["last_name"]
            result["email"] = participant["email"]
        results.append(result)
    return results

def get_questions():
    """Get all questions"""
    return _storage["questions"]
