"""
Azure AI Language Service Helper
Provides sentiment analysis and key phrase extraction using Azure AI Language.
"""

import logging
import os
from typing import Any, Dict, List

from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential


class LanguageServiceHelper:
    """Helper class for Azure AI Language operations."""

    def __init__(self):
        """Initialize the Language Service client."""
        endpoint = os.environ.get('LANGUAGE_ENDPOINT')
        key = os.environ.get('LANGUAGE_KEY')
        
        if not endpoint or not key:
            raise ValueError("LANGUAGE_ENDPOINT and LANGUAGE_KEY environment variables must be set")
        
        self.client = TextAnalyticsClient(
            endpoint=endpoint,
            credential=AzureKeyCredential(key)
        )

    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze the sentiment of the given text.
        
        Args:
            text: The text to analyze.
            
        Returns:
            Dictionary containing:
            - sentiment: 'positive', 'neutral', 'negative', or 'mixed'
            - confidence: Confidence score for the predicted sentiment
            - scores: Detailed scores for each sentiment class
        """
        try:
            documents = [{"id": "1", "text": text, "language": "en"}]
            
            response = self.client.analyze_sentiment(
                documents=documents,
                show_opinion_mining=False
            )
            
            # Get the first (and only) result
            result = response[0]
            
            if result.is_error:
                logging.error(f"Sentiment analysis error: {result.error}")
                return {
                    'sentiment': 'neutral',
                    'confidence': 0,
                    'scores': {},
                    'error': str(result.error)
                }
            
            # Extract sentiment scores
            scores = {
                'positive': result.confidence_scores.positive,
                'neutral': result.confidence_scores.neutral,
                'negative': result.confidence_scores.negative
            }
            
            # Get confidence for the predicted sentiment
            confidence = scores.get(result.sentiment, 0)
            
            return {
                'sentiment': result.sentiment,
                'confidence': confidence,
                'scores': scores
            }
            
        except Exception as e:
            logging.error(f"Error analyzing sentiment: {e}")
            return {
                'sentiment': 'neutral',
                'confidence': 0,
                'scores': {},
                'error': str(e)
            }

    def extract_key_phrases(self, text: str) -> List[str]:
        """
        Extract key phrases from the given text.
        
        Args:
            text: The text to analyze.
            
        Returns:
            List of extracted key phrases.
        """
        try:
            documents = [{"id": "1", "text": text, "language": "en"}]
            
            response = self.client.extract_key_phrases(documents=documents)
            
            # Get the first (and only) result
            result = response[0]
            
            if result.is_error:
                logging.error(f"Key phrase extraction error: {result.error}")
                return []
            
            return list(result.key_phrases)
            
        except Exception as e:
            logging.error(f"Error extracting key phrases: {e}")
            return []

    def analyze_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """
        Analyze multiple texts in a single batch.
        
        Args:
            texts: List of texts to analyze.
            
        Returns:
            List of analysis results.
        """
        if not texts:
            return []
        
        results = []
        
        # Prepare documents
        documents = [
            {"id": str(i), "text": text, "language": "en"}
            for i, text in enumerate(texts)
        ]
        
        try:
            # Analyze sentiment
            sentiment_response = self.client.analyze_sentiment(documents=documents)
            
            # Extract key phrases
            key_phrase_response = self.client.extract_key_phrases(documents=documents)
            
            # Combine results
            for i, (sent, kp) in enumerate(zip(sentiment_response, key_phrase_response)):
                result = {
                    'text': texts[i],
                    'sentiment': 'neutral',
                    'confidence': 0,
                    'scores': {},
                    'key_phrases': []
                }
                
                if not sent.is_error:
                    result['sentiment'] = sent.sentiment
                    result['scores'] = {
                        'positive': sent.confidence_scores.positive,
                        'neutral': sent.confidence_scores.neutral,
                        'negative': sent.confidence_scores.negative
                    }
                    result['confidence'] = result['scores'].get(sent.sentiment, 0)
                
                if not kp.is_error:
                    result['key_phrases'] = list(kp.key_phrases)
                
                results.append(result)
                
        except Exception as e:
            logging.error(f"Error in batch analysis: {e}")
            # Return empty results for all texts
            results = [
                {'text': text, 'sentiment': 'neutral', 'confidence': 0, 'scores': {}, 'key_phrases': [], 'error': str(e)}
                for text in texts
            ]
        
        return results
