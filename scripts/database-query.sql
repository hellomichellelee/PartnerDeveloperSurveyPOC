DROP INDEX IF EXISTS [IX_responses_sentiment] ON [dbo].[responses];

ALTER TABLE dbo.responses
    DROP COLUMN processed_at, sentiment, sentiment_confidence, 
                sentiment_scores_positive, sentiment_scores_negative, 
                sentiment_scores_neutral, key_phrases;

SELECT *
FROM dbo.responses;

