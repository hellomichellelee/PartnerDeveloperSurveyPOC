"""
Database Initialization Script
Connects to Azure SQL and creates the required tables for the survey platform.
"""

import pyodbc
import sys

# Connection details
SERVER = "sql-rfpsurvey-dev-nlppmcvzymz2s.database.windows.net"
DATABASE = "sqldb-responses"
USERNAME = "sqladmin"
PASSWORD = "SurveyPoc2026!"

# Connection string
CONNECTION_STRING = (
    f"Driver={{ODBC Driver 18 for SQL Server}};"
    f"Server=tcp:{SERVER},1433;"
    f"Database={DATABASE};"
    f"Uid={USERNAME};"
    f"Pwd={PASSWORD};"
    f"Encrypt=yes;"
    f"TrustServerCertificate=no;"
    f"Connection Timeout=30;"
)

# SQL statements to create tables
SQL_STATEMENTS = [
    # Participants table
    """
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[participants]') AND type in (N'U'))
    BEGIN
        CREATE TABLE [dbo].[participants] (
            [id] INT IDENTITY(1,1) PRIMARY KEY,
            [submission_id] UNIQUEIDENTIFIER NOT NULL,
            [first_name] NVARCHAR(100) NOT NULL,
            [last_name] NVARCHAR(100) NOT NULL,
            [email] NVARCHAR(255) NOT NULL,
            [company] NVARCHAR(255) NULL,
            [consent_given] BIT NOT NULL DEFAULT 0,
            [consent_timestamp] DATETIME2 NULL,
            [created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
            [updated_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
            CONSTRAINT [UQ_participants_submission_id] UNIQUE ([submission_id])
        );
        CREATE INDEX [IX_participants_email] ON [dbo].[participants] ([email]);
        CREATE INDEX [IX_participants_created_at] ON [dbo].[participants] ([created_at]);
        PRINT 'Created table: participants';
    END
    """,
    
    # Responses table
    """
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[responses]') AND type in (N'U'))
    BEGIN
        CREATE TABLE [dbo].[responses] (
            [id] INT IDENTITY(1,1) PRIMARY KEY,
            [submission_id] UNIQUEIDENTIFIER NOT NULL,
            [topic] NVARCHAR(50) NULL,
            [question_id] NVARCHAR(50) NOT NULL,
            [question_text] NVARCHAR(1000) NULL,
            [response_text] NVARCHAR(MAX) NOT NULL,
            [input_method] NVARCHAR(20) NOT NULL DEFAULT 'text',
            [created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
            [updated_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
        );
        CREATE INDEX [IX_responses_submission_id] ON [dbo].[responses] ([submission_id]);
        CREATE INDEX [IX_responses_topic] ON [dbo].[responses] ([topic]);
        CREATE INDEX [IX_responses_question_id] ON [dbo].[responses] ([question_id]);
        CREATE INDEX [IX_responses_created_at] ON [dbo].[responses] ([created_at]);
        PRINT 'Created table: responses';
    END
    """,
    
    # Questions table
    """
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[questions]') AND type in (N'U'))
    BEGIN
        CREATE TABLE [dbo].[questions] (
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
    """,
    
    # Insert default questions
    """
    IF NOT EXISTS (SELECT 1 FROM [dbo].[questions])
    BEGIN
        INSERT INTO [dbo].[questions] ([question_id], [topic], [question_text], [question_order])
        VALUES 
            ('ctx-1', 'Context', 'Can you describe your role and organization, and how you are involved with Dragon Copilot apps & agents?', 1),
            ('ctx-1b', 'Context', 'Which categories best describe your app or agent?', 2),
            ('ctx-2', 'Context', 'What solution, agent, or integration are you building with Dragon Copilot?', 3),
            ('ctx-3', 'Context', 'What stage is your Dragon Copilot project currently in, and what does that look like in practice?', 4),
            ('onb-1', 'Onboarding', 'Can you walk us through your onboarding experience, from initial sign-up to being ready to develop?', 5),
            ('onb-2', 'Onboarding', 'What resources, documentation, or support did you rely on most during onboarding?', 6),
            ('onb-3', 'Onboarding', 'Were there any parts of onboarding that felt unclear, incomplete, or harder than expected?', 7),
            ('onb-4', 'Onboarding', 'What would you change or improve about the onboarding experience for future partners?', 8),
            ('dev-1', 'Development', 'How would you describe your overall development experience building your Dragon Copilot integration?', 9),
            ('dev-2', 'Development', 'What tools, sample code, or documentation were most helpful during development?', 10),
            ('dev-3', 'Development', 'What were the biggest technical or workflow challenges you encountered while developing your solution?', 11),
            ('dev-4', 'Development', 'What additional tools, documentation, or resources would have made development easier?', 12),
            ('int-1', 'Integration', 'How does your solution integrate into the clinician''s workflow when using Dragon Copilot?', 13),
            ('int-2', 'Integration', 'What Dragon Copilot context or data does your solution rely on?', 14),
            ('int-3', 'Integration', 'Is there any additional data or context that would significantly improve your solution?', 15),
            ('int-4', 'Integration', 'Did you integrate with any external systems (such as EHRs), and what was that experience like?', 16),
            ('test-1', 'Testing', 'How did you approach testing your Dragon Copilot integration?', 17),
            ('test-2', 'Testing', 'What tools or processes did you use to debug issues during development?', 18),
            ('test-3', 'Testing', 'What challenges did you face when testing or validating your solution?', 19),
            ('test-4', 'Testing', 'What would increase your confidence in moving a solution to pilot or production?', 20),
            ('pub-1', 'Publishing', 'What are your plans for deploying or publishing your Dragon Copilot solution?', 21),
            ('pub-2', 'Publishing', 'What has your experience been like preparing your solution for publishing or customer use?', 22),
            ('pub-3', 'Publishing', 'Were there any requirements, reviews, or processes that were difficult to navigate?', 23),
            ('pub-4', 'Publishing', 'What support or guidance would make the publishing process easier?', 24),
            ('wrap-1', 'Wrap-Up', 'What has been the most positive aspect of working with Dragon Copilot so far?', 25),
            ('wrap-2', 'Wrap-Up', 'What has been the biggest challenge or pain point across your experience?', 26),
            ('wrap-3', 'Wrap-Up', 'If you could change or improve one thing about the Dragon Copilot partner experience, what would it be?', 27),
            ('wrap-4', 'Wrap-Up', 'Do you plan to build additional features or integrations in the future? Why or why not?', 28),
            ('wrap-5', 'Wrap-Up', 'Is there anything else you''d like to share that we haven''t asked about?', 29);
        PRINT 'Inserted default survey questions';
    END
    """,
    
    # View for responses with participants
    """
    IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[vw_responses_with_participants]'))
        DROP VIEW [dbo].[vw_responses_with_participants];
    """,
    """
    CREATE VIEW [dbo].[vw_responses_with_participants] AS
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
        p.[created_at] AS participant_created_at
    FROM [dbo].[responses] r
    LEFT JOIN [dbo].[participants] p ON r.[submission_id] = p.[submission_id]
    LEFT JOIN [dbo].[questions] q ON r.[question_id] = q.[question_id];
    """
]


def main():
    print("=" * 60)
    print("Research Feedback Platform - Database Initialization")
    print("=" * 60)
    print(f"\nConnecting to: {SERVER}")
    print(f"Database: {DATABASE}")
    
    try:
        # Connect to database
        print("\n[1/2] Connecting to Azure SQL...")
        conn = pyodbc.connect(CONNECTION_STRING)
        cursor = conn.cursor()
        print("✓ Connected successfully!")
        
        # Execute each SQL statement
        print("\n[2/2] Creating database schema...")
        for i, sql in enumerate(SQL_STATEMENTS, 1):
            try:
                cursor.execute(sql)
                conn.commit()
                print(f"  ✓ Statement {i}/{len(SQL_STATEMENTS)} executed")
            except Exception as e:
                print(f"  ⚠ Statement {i}: {str(e)[:50]}...")
        
        # Verify tables were created
        print("\n" + "=" * 60)
        print("Verifying created objects...")
        cursor.execute("""
            SELECT 'Table' AS Type, name FROM sys.tables WHERE schema_id = SCHEMA_ID('dbo')
            UNION ALL
            SELECT 'View' AS Type, name FROM sys.views WHERE schema_id = SCHEMA_ID('dbo')
            ORDER BY Type, name
        """)
        
        rows = cursor.fetchall()
        print(f"\nCreated {len(rows)} objects:")
        for row in rows:
            print(f"  ✓ {row[0]}: {row[1]}")
        
        # Close connection
        cursor.close()
        conn.close()
        
        print("\n" + "=" * 60)
        print("✅ Database initialization complete!")
        print("=" * 60)
        return 0
        
    except pyodbc.Error as e:
        print(f"\n❌ Database error: {e}")
        print("\nTroubleshooting:")
        print("  1. Ensure ODBC Driver 18 for SQL Server is installed")
        print("  2. Check firewall rules allow your IP")
        print("  3. Verify credentials are correct")
        return 1
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
