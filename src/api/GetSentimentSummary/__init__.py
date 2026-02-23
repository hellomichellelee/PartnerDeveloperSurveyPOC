"""
GetSentimentSummary Function
Returns sentiment analysis summary from in-memory storage.
For production, implement proper database connectivity via GitHub Actions deployment.
"""

import json
import logging
import sys
import os
import azure.functions as func

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from shared.storage import get_sentiment_summary, get_all_responses

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('GetSentimentSummary function triggered')
    
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }
    
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=headers)
    
    try:
        # Get overall sentiment summary
        summary = get_sentiment_summary()
        all_responses = get_all_responses()
        
        # Get unique submissions
        submission_ids = set(r.get('submission_id') for r in all_responses)
        
        # Calculate sentiment by question
        questions = {}
        for response in all_responses:
            q_id = response.get('question_id', 0)
            if q_id not in questions:
                questions[q_id] = {
                    "question_id": q_id,
                    "question_text": response.get('question_text', ''),
                    "total_responses": 0,
                    "positive_count": 0,
                    "negative_count": 0,
                    "neutral_count": 0,
                    "mixed_count": 0
                }
            
            questions[q_id]["total_responses"] += 1
            sentiment = response.get('sentiment', 'neutral').lower()
            if sentiment == "positive":
                questions[q_id]["positive_count"] += 1
            elif sentiment == "negative":
                questions[q_id]["negative_count"] += 1
            elif sentiment == "mixed":
                questions[q_id]["mixed_count"] += 1
            else:
                questions[q_id]["neutral_count"] += 1
        
        overall = {
            "totalSubmissions": len(submission_ids),
            "totalResponses": summary["total"],
            "processedResponses": summary["total"],  # All are processed in mock
            "pendingResponses": 0,
            "sentimentBreakdown": {
                "positive": summary["positive"],
                "negative": summary["negative"],
                "neutral": summary["neutral"],
                "mixed": summary["mixed"]
            }
        }
        
        result = {
            "overall": overall,
            "byQuestion": list(questions.values())
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
