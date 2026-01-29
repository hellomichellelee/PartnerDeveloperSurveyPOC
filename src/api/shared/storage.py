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
        "input_method": input_method,
        "sentiment": analyze_sentiment_mock(response_text),
        "processed": True
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

def get_sentiment_summary():
    """Get sentiment summary statistics"""
    responses = _storage["responses"]
    if not responses:
        return {"total": 0, "positive": 0, "negative": 0, "neutral": 0, "mixed": 0}
    
    summary = {"total": len(responses), "positive": 0, "negative": 0, "neutral": 0, "mixed": 0}
    for r in responses:
        sentiment = r.get("sentiment", "neutral").lower()
        if sentiment in summary:
            summary[sentiment] += 1
    
    return summary

def analyze_sentiment_mock(text: str) -> str:
    """Simple mock sentiment analysis based on keywords"""
    if not text:
        return "neutral"
    
    text_lower = text.lower()
    
    positive_words = ["great", "excellent", "love", "amazing", "wonderful", "fantastic", "good", "best", "awesome", "happy", "recommend", "helpful", "satisfied", "impressive", "valuable"]
    negative_words = ["bad", "terrible", "hate", "awful", "horrible", "poor", "worst", "disappointed", "frustrating", "annoying", "slow", "broken", "useless", "difficult", "confusing"]
    
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > 0 and negative_count > 0:
        return "mixed"
    elif positive_count > negative_count:
        return "positive"
    elif negative_count > positive_count:
        return "negative"
    else:
        return "neutral"

def get_questions():
    """Get all questions"""
    return _storage["questions"]
