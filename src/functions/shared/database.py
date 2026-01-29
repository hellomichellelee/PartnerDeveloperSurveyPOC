"""
Database Helper Module
Provides database operations for the survey application.
"""

import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

import pyodbc


class DatabaseHelper:
    """Helper class for database operations."""

    def __init__(self):
        """Initialize database connection."""
        self.connection_string = os.environ.get('SQL_CONNECTION_STRING')
        if not self.connection_string:
            raise ValueError("SQL_CONNECTION_STRING environment variable not set")

    def _get_connection(self):
        """Get a database connection."""
        return pyodbc.connect(self.connection_string)

    def insert_participant(
        self,
        submission_id: str,
        first_name: str,
        last_name: str,
        email: str,
        consent_given: bool,
        consent_timestamp: Optional[str] = None
    ) -> int:
        """
        Insert a participant record.
        
        Returns:
            The ID of the inserted participant.
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO participants (
                    submission_id, first_name, last_name, email,
                    consent_given, consent_timestamp, created_at
                )
                OUTPUT INSERTED.id
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                submission_id,
                first_name,
                last_name,
                email,
                consent_given,
                consent_timestamp or datetime.utcnow().isoformat(),
                datetime.utcnow()
            ))
            
            result = cursor.fetchone()
            conn.commit()
            
            return result[0] if result else None

    def insert_response(
        self,
        submission_id: str,
        question_id: str,
        question_text: str,
        response_text: str,
        input_mode: str = 'text',
        timestamp: Optional[str] = None
    ) -> int:
        """
        Insert a survey response.
        
        Returns:
            The ID of the inserted response.
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO responses (
                    submission_id, question_id, question_text,
                    response_text, input_mode, response_timestamp,
                    processed, created_at
                )
                OUTPUT INSERTED.id
                VALUES (?, ?, ?, ?, ?, ?, 0, ?)
            """, (
                submission_id,
                question_id,
                question_text,
                response_text,
                input_mode,
                timestamp or datetime.utcnow().isoformat(),
                datetime.utcnow()
            ))
            
            result = cursor.fetchone()
            conn.commit()
            
            return result[0] if result else None

    def get_unprocessed_responses(self, batch_size: int = 50) -> List[Dict[str, Any]]:
        """
        Get unprocessed responses for batch processing.
        
        Args:
            batch_size: Maximum number of responses to return.
            
        Returns:
            List of unprocessed response dictionaries.
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT TOP (?)
                    r.id, r.submission_id, r.question_id, r.question_text,
                    r.response_text, r.input_mode, r.response_timestamp
                FROM responses r
                WHERE r.processed = 0
                ORDER BY r.created_at ASC
            """, (batch_size,))
            
            columns = [column[0] for column in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]

    def mark_as_processed(self, response_id: int, results: Dict[str, Any]) -> None:
        """
        Mark a response as processed and store analysis results.
        
        Args:
            response_id: The ID of the response to update.
            results: Dictionary containing processing results.
        """
        import json
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE responses
                SET processed = 1,
                    processed_at = ?,
                    sentiment = ?,
                    sentiment_confidence = ?,
                    sentiment_scores = ?,
                    key_phrases = ?,
                    processing_error = ?
                WHERE id = ?
            """, (
                datetime.utcnow(),
                results.get('sentiment'),
                results.get('sentiment_confidence'),
                json.dumps(results.get('sentiment_scores')) if results.get('sentiment_scores') else None,
                json.dumps(results.get('key_phrases')) if results.get('key_phrases') else None,
                results.get('processing_error'),
                response_id
            ))
            conn.commit()

    def get_responses(
        self,
        limit: int = 100,
        offset: int = 0,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Get responses with optional filtering.
        
        Args:
            limit: Maximum number of responses to return.
            offset: Number of responses to skip.
            filters: Optional filters (e.g., processed=True).
            
        Returns:
            List of response dictionaries.
        """
        filters = filters or {}
        
        query = """
            SELECT 
                r.id, r.submission_id, r.question_id, r.question_text,
                r.response_text, r.input_mode, r.response_timestamp,
                r.processed, r.sentiment, r.sentiment_confidence,
                r.key_phrases, p.first_name, p.last_name, p.email
            FROM responses r
            LEFT JOIN participants p ON r.submission_id = p.submission_id
            WHERE 1=1
        """
        params = []

        if 'processed' in filters:
            query += " AND r.processed = ?"
            params.append(1 if filters['processed'] else 0)

        query += " ORDER BY r.created_at DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
        params.extend([offset, limit])

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            
            columns = [column[0] for column in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]

    def get_response_count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Get total count of responses matching filters."""
        filters = filters or {}
        
        query = "SELECT COUNT(*) FROM responses r WHERE 1=1"
        params = []

        if 'processed' in filters:
            query += " AND r.processed = ?"
            params.append(1 if filters['processed'] else 0)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            return cursor.fetchone()[0]
