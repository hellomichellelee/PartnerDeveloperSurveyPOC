-- =============================================================================
-- Research Feedback Data Collection Platform
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
-- Stores raw survey responses
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
        
        -- Timestamps
        [created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        -- Foreign key to participants
        CONSTRAINT [FK_responses_participants] FOREIGN KEY ([submission_id]) 
            REFERENCES [dbo].[participants] ([submission_id]) ON DELETE CASCADE,
        
        -- Check constraints
        CONSTRAINT [CK_responses_input_method] CHECK ([input_method] IN ('voice', 'text'))
    );
    
    CREATE INDEX [IX_responses_submission_id] ON [dbo].[responses] ([submission_id]);
    CREATE INDEX [IX_responses_question_id] ON [dbo].[responses] ([question_id]);
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
ORDER BY ObjectType, ObjectName;
GO
