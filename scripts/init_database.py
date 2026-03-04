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
            ('prov-1', 'Provisioning', 'Can you describe what the provisioning experience was like for you?', 1),
            ('prov-2', 'Provisioning', 'Was there any part of the Provision process that felt unclear to you?', 2),
            ('prov-3', 'Provisioning', 'Is the term provision something you were familiar with?', 3),
            ('prov-4', 'Provisioning', 'How does this new process compare to how you rolled out features in NMC?', 4),
            ('env-1', 'Environments', 'What kinds of organizational structures or IT management needs do you expect your environment structure to reflect?', 5),
            ('env-2', 'Environments', 'What kinds of scenarios require you to create, manage, or modify environments?', 6),
            ('env-3', 'Environments', 'Do you think having the ability to create multiple environments in DAC is useful?', 7),
            ('org-1', 'Organizations', 'How do you feel about organization units?', 8),
            ('org-2', 'Organizations', 'Have you taken advantage of this flexibility?', 9),
            ('org-3', 'Organizations', 'How could the interface make it easier to find or manage your hierarchy?', 10),
            ('org-4', 'Organizations', 'What kinds of scenarios require you to create, manage, or modify org units?', 11),
            ('org-5', 'Organizations', 'Did you encounter any unexpected behavior with Org Units?', 12),
            ('txt-1', 'Texts', 'What types of texts do you manage for your organization?', 13),
            ('txt-2', 'Texts', 'Describe how you would add or modify a Text in DAC.', 14),
            ('txt-3', 'Texts', 'Is it clear how to manage the scope of a Text?', 15),
            ('txt-4', 'Texts', 'Have you made use of organization-level or unit-level text capability?', 16),
            ('txt-5', 'Texts', 'Do you use the cut/copy/paste feature for texts across Organization units?', 17),
            ('prm-1', 'Prompts', 'Have you explored the Prompts feature in DAC?', 18),
            ('prm-2', 'Prompts', 'What Prompts have you tried to create or use?', 19),
            ('prm-3', 'Prompts', 'Do you have concerns about managing AI prompts for your users?', 20),
            ('prm-4', 'Prompts', 'What scenarios might cause you to add, edit, or delete prompts?', 21),
            ('voc-1', 'Vocabulary', 'Have you worked with vocabulary items in DAC?', 22),
            ('voc-2', 'Vocabulary', 'What kinds of tasks do you normally do with custom vocabulary?', 23),
            ('voc-3', 'Vocabulary', 'Is the organization/unit-level vocabulary flexibility something you use?', 24),
            ('voc-4', 'Vocabulary', 'How many vocabulary items do you manage?', 25),
            ('wf-1', 'Workflows', 'Have you accessed or managed any Workflows in DAC?', 26),
            ('wf-2', 'Workflows', 'What was your experience creating workflows?', 27),
            ('wf-3', 'Workflows', 'What kinds of workflows do you manage?', 28),
            ('wf-4', 'Workflows', 'How often do you update multi-step Workflows?', 29),
            ('set-1', 'Settings', 'Were you able to find where to manage global settings in DAC?', 30),
            ('set-2', 'Settings', 'Is it clear how to change a setting for a subset of users?', 31),
            ('set-3', 'Settings', 'How do you feel about the organization-unit level settings override?', 32),
            ('set-4', 'Settings', 'Have you utilized locking for settings?', 33),
            ('set-5', 'Settings', 'Are there settings you expected to find in DAC that you have not?', 34);
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
