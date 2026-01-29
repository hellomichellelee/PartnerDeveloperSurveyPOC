"""
ProcessResponses Azure Function
Timer-triggered function that processes unprocessed survey responses
using Azure AI Language for sentiment analysis and key phrase extraction.
"""

import json
import logging
import os
from datetime import datetime

import azure.functions as func

# Try to import helpers
try:
    from ..shared.database import DatabaseHelper
    from ..shared.language_service import LanguageServiceHelper
    HELPERS_AVAILABLE = True
except ImportError:
    HELPERS_AVAILABLE = False


def main(timer: func.TimerRequest) -> None:
    """
    Timer trigger function to process unprocessed survey responses.
    Runs every 5 minutes by default.
    
    Processing steps:
    1. Fetch unprocessed responses from database
    2. Analyze sentiment using Azure AI Language
    3. Extract key phrases using Azure AI Language
    4. Update database with processed results
    """
    logging.info('ProcessResponses function triggered at %s', datetime.utcnow().isoformat())

    if timer.past_due:
        logging.warning('Timer is past due!')

    if not HELPERS_AVAILABLE:
        logging.warning("Required helpers not available. Skipping processing.")
        return

    try:
        db = DatabaseHelper()
        language = LanguageServiceHelper()

        # Get unprocessed responses
        unprocessed = db.get_unprocessed_responses(batch_size=50)
        
        if not unprocessed:
            logging.info("No unprocessed responses found")
            return

        logging.info(f"Processing {len(unprocessed)} responses")

        # Process each response
        processed_count = 0
        error_count = 0

        for response in unprocessed:
            try:
                response_text = response['response_text']
                response_id = response['id']

                # Skip empty responses
                if not response_text or len(response_text.strip()) < 3:
                    db.mark_as_processed(response_id, {
                        'sentiment': 'neutral',
                        'sentiment_confidence': 0,
                        'key_phrases': [],
                        'processing_note': 'Response too short for analysis'
                    })
                    continue

                # Analyze sentiment
                sentiment_result = language.analyze_sentiment(response_text)
                
                # Extract key phrases
                key_phrases = language.extract_key_phrases(response_text)

                # Update database with results
                db.mark_as_processed(response_id, {
                    'sentiment': sentiment_result['sentiment'],
                    'sentiment_confidence': sentiment_result['confidence'],
                    'sentiment_scores': sentiment_result['scores'],
                    'key_phrases': key_phrases,
                    'processed_at': datetime.utcnow().isoformat()
                })

                processed_count += 1
                logging.info(f"Processed response {response_id}: {sentiment_result['sentiment']}")

            except Exception as e:
                error_count += 1
                logging.error(f"Error processing response {response.get('id')}: {e}")
                
                # Mark as processed with error
                try:
                    db.mark_as_processed(response['id'], {
                        'processing_error': str(e),
                        'processed_at': datetime.utcnow().isoformat()
                    })
                except:
                    pass

        logging.info(f"Processing complete. Processed: {processed_count}, Errors: {error_count}")

    except Exception as e:
        logging.error(f"Error in ProcessResponses function: {e}")
        raise
