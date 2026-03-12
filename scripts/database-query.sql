
-- =============================================================================
-- Add company column to participants table
-- =============================================================================
ALTER TABLE [dbo].[participants] ADD [company] NVARCHAR(255) NULL;
GO

-- =============================================================================
-- Recreate view to include company field
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
        p.[company],
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

-- =============================================================================
-- Add ctx-1b to the questions table
-- =============================================================================
IF NOT EXISTS (SELECT 1
FROM [dbo].[questions]
WHERE [question_id] = 'ctx-1b')
BEGIN
    INSERT INTO [dbo].[questions]
        ([question_id], [topic], [question_text], [question_order])
    VALUES
        ('ctx-1b', 'Context', 'Which categories best describe your app or agent?', 2);

    -- Update ordering for subsequent questions
    UPDATE [dbo].[questions] SET [question_order] = [question_order] + 1 
    WHERE [question_order] >= 2 AND [question_id] != 'ctx-1b';
END
GO

