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

IF NOT EXISTS (SELECT *
FROM sys.objects
WHERE object_id = OBJECT_ID(N'[dbo].[participants]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[participants]
    (
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

IF NOT EXISTS (SELECT *
FROM sys.objects
WHERE object_id = OBJECT_ID(N'[dbo].[responses]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[responses]
    (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [submission_id] UNIQUEIDENTIFIER NOT NULL,
        [topic] NVARCHAR(50) NULL,
        [question_id] NVARCHAR(50) NOT NULL,
        [question_text] NVARCHAR(1000) NULL,
        [response_text] NVARCHAR(MAX) NOT NULL,
        [input_method] NVARCHAR(20) NOT NULL DEFAULT 'text',
        -- 'voice' or 'text'

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
    CREATE INDEX [IX_responses_topic] ON [dbo].[responses] ([topic]);
    CREATE INDEX [IX_responses_question_id] ON [dbo].[responses] ([question_id]);
    CREATE INDEX [IX_responses_created_at] ON [dbo].[responses] ([created_at]);

    PRINT 'Created table: responses';
END
GO

-- =============================================================================
-- Table: questions
-- Stores the survey questions (for reference and reporting)
-- =============================================================================

IF NOT EXISTS (SELECT *
FROM sys.objects
WHERE object_id = OBJECT_ID(N'[dbo].[questions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[questions]
    (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [question_id] NVARCHAR(50) NOT NULL,
        [topic] NVARCHAR(50) NOT NULL DEFAULT '',
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

IF NOT EXISTS (SELECT 1
FROM [dbo].[questions])
BEGIN
    INSERT INTO [dbo].[questions]
        ([question_id], [topic], [question_text], [question_order])
    VALUES
        ('prov-1', 'Provisioning', 'Can you describe what the provisioning experience was like for you?', 1),
        ('prov-2', 'Provisioning', 'Was there any part of the Provision process that felt unclear to you?', 2),
        ('prov-3', 'Provisioning', 'Is the term provision something you were familiar with, or is it a concept you don''t encounter frequently?', 3),
        ('prov-4', 'Provisioning', 'How does this new process compare to how you rolled out features in NMC?', 4),
        ('env-1', 'Environments', 'What kinds of organizational structures or IT management needs do you expect your environment structure to reflect?', 5),
        ('env-2', 'Environments', 'What kinds of scenarios require you to create, manage, or modify environments? How frequently do you conduct this type of work?', 6),
        ('env-3', 'Environments', 'Do you think having the ability to create multiple environments in DAC is useful for your organization''s workflows?', 7),
        ('org-1', 'Organizations', 'How do you feel about organization units? Do they make organizing users and resources easier or harder for you?', 8),
        ('org-2', 'Organizations', 'Have you taken advantage of this flexibility? For example, have you restructured or added new Organization units?', 9),
        ('org-3', 'Organizations', 'How could the interface make it easier to find or manage your hierarchy?', 10),
        ('org-4', 'Organizations', 'What kinds of scenarios require you to create, manage, or modify org units? How frequently do you conduct this type of work?', 11),
        ('org-5', 'Organizations', 'Did you encounter any unexpected behavior or things you''d like to change about how Org Units work?', 12),
        ('txt-1', 'Texts', 'What types of texts do you manage for your organization? How often do you create or edit these?', 13),
        ('txt-2', 'Texts', 'Describe how you would add or modify a Text in DAC. Was it easy to do? Any challenges you encountered?', 14),
        ('txt-3', 'Texts', 'Is it clear how to manage the scope of a Text?', 15),
        ('txt-4', 'Texts', 'In Dragon admin center, texts can be defined at the organization-level or specified for a specific organization unit. Have you made use of that capability?', 16),
        ('txt-5', 'Texts', 'DAC supports cutting or copying a text from one Organization unit and pasting it into another. Do you use this feature?', 17),
        ('prm-1', 'Prompts', 'Prompts act as custom templates for frequent AI-generated content in Dragon Copilot. Have you explored the Prompts feature?', 18),
        ('prm-2', 'Prompts', 'What Prompts have you tried to create or use? How was the process of creating a custom prompt in DAC?', 19),
        ('prm-3', 'Prompts', 'Do you have any concerns or uncertainty about how you''d manage or govern these AI prompts for your users?', 20),
        ('prm-4', 'Prompts', 'What scenarios might cause you to add, edit, or delete prompts? How frequently would you expect to encounter these scenarios?', 21),
        ('voc-1', 'Vocabulary', 'Have you worked with vocabulary items in DAC? How has your experience been?', 22),
        ('voc-2', 'Vocabulary', 'What kinds of tasks do you normally do with custom vocabulary? Have you done any of those in DAC yet?', 23),
        ('voc-3', 'Vocabulary', 'DAC lets you apply custom vocabulary at the organization-level or to a specific organization unit. Is this flexibility something you''ve used or plan to use?', 24),
        ('voc-4', 'Vocabulary', 'How many vocabulary items do you manage for your organization? Can you describe how they are scoped?', 25),
        ('wf-1', 'Workflows', 'NMC Step-by-Step Commands are now called Workflows in DAC. Have you accessed or managed any Workflows?', 26),
        ('wf-2', 'Workflows', 'What was your experience like? (E.g., creating a multi-step sequence, setting a spoken trigger phrase, etc.)', 27),
        ('wf-3', 'Workflows', 'What kinds of workflows do you manage for your organization? How many workflows? What are some common use cases?', 28),
        ('wf-4', 'Workflows', 'How often do you typically use or update these kinds of multi-step Workflows in administration?', 29),
        ('set-1', 'Settings', 'Were you able to find where to manage global settings for your organization in DAC?', 30),
        ('set-2', 'Settings', 'Is it clear how you would change a particular setting for only a subset of users in DAC?', 31),
        ('set-3', 'Settings', 'In NMC, settings could be applied at the site or group level. In DAC, you can override at a lower level. How do you feel about this?', 32),
        ('set-4', 'Settings', 'Have you utilized locking for settings? Do you have any concerns about how it works?', 33),
        ('set-5', 'Settings', 'Are there any settings or configuration options you expected to find in DAC that you haven''t found yet?', 34);

    PRINT 'Inserted default survey questions';
END
GO

-- =============================================================================
-- View: vw_responses_with_participants
-- Combined view for easy querying and Power BI reporting
-- =============================================================================

IF EXISTS (SELECT *
FROM sys.views
WHERE object_id = OBJECT_ID(N'[dbo].[vw_responses_with_participants]'))
    DROP VIEW [dbo].[vw_responses_with_participants];
GO

CREATE VIEW [dbo].[vw_responses_with_participants]
AS
    SELECT
        r.[id] AS response_id,
        r.[submission_id],
        p.[first_name],
        p.[last_name],
        p.[email],
        r.[topic],
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

    SELECT 'Tables' AS ObjectType, name AS ObjectName
    FROM sys.tables
    WHERE schema_id = SCHEMA_ID('dbo')
UNION ALL
    SELECT 'Views' AS ObjectType, name AS ObjectName
    FROM sys.views
    WHERE schema_id = SCHEMA_ID('dbo')
ORDER BY ObjectType, ObjectName;
GO
