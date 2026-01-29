-- =============================================================================
-- Research Feedback Processing & Insights Platform
-- Database Initialization Script
-- =============================================================================

-- Create database if not exists (run this manually if needed)
-- CREATE DATABASE [sqldb-responses];
-- GO

-- Use the responses database
-- USE [sqldb-responses];
-- GO

-- =============================================================================
-- Table: participants
-- Stores participant information and consent
-- =============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[participants]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[participants] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [submission_id] UNIQUEIDENTIFIER NOT NULL,
        [first_name] NVARCHAR(100) NOT NULL,
        [last_name] NVARCHAR(100) NOT NULL,
        [email] NVARCHAR(255) NOT NULL,
        [consent_given] BIT NOT NULL DEFAULT 0,
        [consent_timestamp] DATETIME2 NULL,
        [created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT [UQ_participants_submission_id] UNIQUE ([submission_id]),
        CONSTRAINT [CK_participants_consent] CHECK ([consent_given] = 1)
    );
    
    CREATE INDEX [IX_participants_email] ON [dbo].[participants] ([email]);
    CREATE INDEX [IX_participants_created_at] ON [dbo].[participants] ([created_at]);
    
    PRINT 'Created table: participants';
END
GO

-- =============================================================================
-- Table: responses
-- Stores raw and processed survey responses
-- =============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[responses]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[responses] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [submission_id] UNIQUEIDENTIFIER NOT NULL,
        [question_id] NVARCHAR(50) NOT NULL,
        [question_text] NVARCHAR(1000) NULL,
        [response_text] NVARCHAR(MAX) NOT NULL,
        [input_method] NVARCHAR(20) NOT NULL DEFAULT 'text', -- 'voice' or 'text'
        
        -- Processing status
        [processed] BIT NOT NULL DEFAULT 0,
        [processed_at] DATETIME2 NULL,
        
        -- Sentiment analysis results
        [sentiment] NVARCHAR(20) NULL, -- 'positive', 'negative', 'neutral', 'mixed'
        [sentiment_confidence] DECIMAL(5,4) NULL,
        [sentiment_scores_positive] DECIMAL(5,4) NULL,
        [sentiment_scores_negative] DECIMAL(5,4) NULL,
        [sentiment_scores_neutral] DECIMAL(5,4) NULL,
        
        -- Key phrases (stored as JSON array)
        [key_phrases] NVARCHAR(MAX) NULL,
        
        -- Timestamps
        [created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        -- Foreign key to participants
        CONSTRAINT [FK_responses_participants] FOREIGN KEY ([submission_id]) 
            REFERENCES [dbo].[participants] ([submission_id]) ON DELETE CASCADE,
        
        -- Check constraints
        CONSTRAINT [CK_responses_input_method] CHECK ([input_method] IN ('voice', 'text')),
        CONSTRAINT [CK_responses_sentiment] CHECK ([sentiment] IS NULL OR [sentiment] IN ('positive', 'negative', 'neutral', 'mixed'))
    );
    
    CREATE INDEX [IX_responses_submission_id] ON [dbo].[responses] ([submission_id]);
    CREATE INDEX [IX_responses_question_id] ON [dbo].[responses] ([question_id]);
    CREATE INDEX [IX_responses_processed] ON [dbo].[responses] ([processed]) WHERE [processed] = 0;
    CREATE INDEX [IX_responses_sentiment] ON [dbo].[responses] ([sentiment]);
    CREATE INDEX [IX_responses_created_at] ON [dbo].[responses] ([created_at]);
    
    PRINT 'Created table: responses';
END
GO

-- =============================================================================
-- Table: questions
-- Stores the survey questions (for reference and reporting)
-- =============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[questions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[questions] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [question_id] NVARCHAR(50) NOT NULL,
        [question_text] NVARCHAR(1000) NOT NULL,
        [question_order] INT NOT NULL DEFAULT 0,
        [is_active] BIT NOT NULL DEFAULT 1,
        [created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT [UQ_questions_question_id] UNIQUE ([question_id])
    );
    
    PRINT 'Created table: questions';
END
GO

-- =============================================================================
-- Table: processing_logs
-- Stores processing job logs for monitoring and debugging
-- =============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[processing_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[processing_logs] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [batch_id] UNIQUEIDENTIFIER NOT NULL,
        [responses_processed] INT NOT NULL DEFAULT 0,
        [responses_failed] INT NOT NULL DEFAULT 0,
        [status] NVARCHAR(20) NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
        [error_message] NVARCHAR(MAX) NULL,
        [started_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [completed_at] DATETIME2 NULL,
        [duration_seconds] INT NULL
    );
    
    CREATE INDEX [IX_processing_logs_batch_id] ON [dbo].[processing_logs] ([batch_id]);
    CREATE INDEX [IX_processing_logs_started_at] ON [dbo].[processing_logs] ([started_at]);
    
    PRINT 'Created table: processing_logs';
END
GO

-- =============================================================================
-- Insert default survey questions
-- =============================================================================

IF NOT EXISTS (SELECT 1 FROM [dbo].[questions])
BEGIN
    INSERT INTO [dbo].[questions] ([question_id], [question_text], [question_order])
    VALUES 
        ('q1', 'What was your overall experience using the product?', 1),
        ('q2', 'What features did you find most useful?', 2),
        ('q3', 'What challenges or frustrations did you encounter?', 3),
        ('q4', 'What improvements would you suggest?', 4),
        ('q5', 'Would you recommend this product to others? Why or why not?', 5);
    
    PRINT 'Inserted default survey questions';
END
GO

-- =============================================================================
-- View: vw_responses_with_participants
-- Combined view for easy querying and Power BI reporting
-- =============================================================================

IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[vw_responses_with_participants]'))
    DROP VIEW [dbo].[vw_responses_with_participants];
GO

CREATE VIEW [dbo].[vw_responses_with_participants] AS
SELECT 
    r.[id] AS response_id,
    r.[submission_id],
    p.[first_name],
    p.[last_name],
    p.[email],
    r.[question_id],
    q.[question_text],
    r.[response_text],
    r.[input_method],
    r.[processed],
    r.[processed_at],
    r.[sentiment],
    r.[sentiment_confidence],
    r.[sentiment_scores_positive],
    r.[sentiment_scores_negative],
    r.[sentiment_scores_neutral],
    r.[key_phrases],
    r.[created_at] AS response_created_at,
    p.[created_at] AS participant_created_at,
    p.[consent_given],
    p.[consent_timestamp]
FROM [dbo].[responses] r
INNER JOIN [dbo].[participants] p ON r.[submission_id] = p.[submission_id]
LEFT JOIN [dbo].[questions] q ON r.[question_id] = q.[question_id];
GO

PRINT 'Created view: vw_responses_with_participants';
GO

-- =============================================================================
-- View: vw_sentiment_summary
-- Aggregated sentiment statistics for dashboard
-- =============================================================================

IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[vw_sentiment_summary]'))
    DROP VIEW [dbo].[vw_sentiment_summary];
GO

CREATE VIEW [dbo].[vw_sentiment_summary] AS
SELECT 
    [question_id],
    COUNT(*) AS total_responses,
    SUM(CASE WHEN [sentiment] = 'positive' THEN 1 ELSE 0 END) AS positive_count,
    SUM(CASE WHEN [sentiment] = 'negative' THEN 1 ELSE 0 END) AS negative_count,
    SUM(CASE WHEN [sentiment] = 'neutral' THEN 1 ELSE 0 END) AS neutral_count,
    SUM(CASE WHEN [sentiment] = 'mixed' THEN 1 ELSE 0 END) AS mixed_count,
    AVG([sentiment_confidence]) AS avg_confidence,
    AVG([sentiment_scores_positive]) AS avg_positive_score,
    AVG([sentiment_scores_negative]) AS avg_negative_score,
    AVG([sentiment_scores_neutral]) AS avg_neutral_score,
    SUM(CASE WHEN [processed] = 1 THEN 1 ELSE 0 END) AS processed_count,
    SUM(CASE WHEN [processed] = 0 THEN 1 ELSE 0 END) AS pending_count
FROM [dbo].[responses]
GROUP BY [question_id];
GO

PRINT 'Created view: vw_sentiment_summary';
GO

-- =============================================================================
-- Stored Procedure: sp_get_unprocessed_responses
-- Gets batch of unprocessed responses for processing pipeline
-- =============================================================================

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_get_unprocessed_responses]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_get_unprocessed_responses];
GO

CREATE PROCEDURE [dbo].[sp_get_unprocessed_responses]
    @BatchSize INT = 100
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@BatchSize)
        [id],
        [submission_id],
        [question_id],
        [response_text],
        [created_at]
    FROM [dbo].[responses]
    WHERE [processed] = 0
    ORDER BY [created_at] ASC;
END
GO

PRINT 'Created stored procedure: sp_get_unprocessed_responses';
GO

-- =============================================================================
-- Stored Procedure: sp_mark_response_processed
-- Marks a response as processed with sentiment and key phrases
-- =============================================================================

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_mark_response_processed]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_mark_response_processed];
GO

CREATE PROCEDURE [dbo].[sp_mark_response_processed]
    @ResponseId INT,
    @Sentiment NVARCHAR(20),
    @SentimentConfidence DECIMAL(5,4),
    @SentimentPositive DECIMAL(5,4),
    @SentimentNegative DECIMAL(5,4),
    @SentimentNeutral DECIMAL(5,4),
    @KeyPhrases NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE [dbo].[responses]
    SET 
        [processed] = 1,
        [processed_at] = GETUTCDATE(),
        [sentiment] = @Sentiment,
        [sentiment_confidence] = @SentimentConfidence,
        [sentiment_scores_positive] = @SentimentPositive,
        [sentiment_scores_negative] = @SentimentNegative,
        [sentiment_scores_neutral] = @SentimentNeutral,
        [key_phrases] = @KeyPhrases,
        [updated_at] = GETUTCDATE()
    WHERE [id] = @ResponseId;
    
    RETURN @@ROWCOUNT;
END
GO

PRINT 'Created stored procedure: sp_mark_response_processed';
GO

-- =============================================================================
-- Verification
-- =============================================================================

PRINT '';
PRINT '=============================================================================';
PRINT 'Database initialization complete!';
PRINT '=============================================================================';
PRINT '';

SELECT 'Tables' AS ObjectType, name AS ObjectName FROM sys.tables WHERE schema_id = SCHEMA_ID('dbo')
UNION ALL
SELECT 'Views' AS ObjectType, name AS ObjectName FROM sys.views WHERE schema_id = SCHEMA_ID('dbo')
UNION ALL
SELECT 'Procedures' AS ObjectType, name AS ObjectName FROM sys.procedures WHERE schema_id = SCHEMA_ID('dbo')
ORDER BY ObjectType, ObjectName;
GO
