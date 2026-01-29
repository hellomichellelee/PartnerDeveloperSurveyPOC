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
            [question_id] NVARCHAR(50) NOT NULL,
            [question_text] NVARCHAR(1000) NULL,
            [response_text] NVARCHAR(MAX) NOT NULL,
            [input_method] NVARCHAR(20) NOT NULL DEFAULT 'text',
            [processed] BIT NOT NULL DEFAULT 0,
            [processed_at] DATETIME2 NULL,
            [sentiment] NVARCHAR(20) NULL,
            [sentiment_confidence] DECIMAL(5,4) NULL,
            [sentiment_scores_positive] DECIMAL(5,4) NULL,
            [sentiment_scores_negative] DECIMAL(5,4) NULL,
            [sentiment_scores_neutral] DECIMAL(5,4) NULL,
            [key_phrases] NVARCHAR(MAX) NULL,
            [created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
            [updated_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
        );
        CREATE INDEX [IX_responses_submission_id] ON [dbo].[responses] ([submission_id]);
        CREATE INDEX [IX_responses_question_id] ON [dbo].[responses] ([question_id]);
        CREATE INDEX [IX_responses_processed] ON [dbo].[responses] ([processed]) WHERE [processed] = 0;
        CREATE INDEX [IX_responses_sentiment] ON [dbo].[responses] ([sentiment]);
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
        INSERT INTO [dbo].[questions] ([question_id], [question_text], [question_order])
        VALUES 
            ('q1', 'What was your overall experience using the product?', 1),
            ('q2', 'What features did you find most useful?', 2),
            ('q3', 'What challenges or frustrations did you encounter?', 3),
            ('q4', 'What improvements would you suggest?', 4),
            ('q5', 'Would you recommend this product to others? Why or why not?', 5);
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
        r.[question_id],
        q.[question_text],
        r.[response_text],
        r.[input_method],
        r.[processed],
        r.[processed_at],
        r.[sentiment],
        r.[sentiment_confidence],
        r.[key_phrases],
        r.[created_at] AS response_created_at,
        p.[created_at] AS participant_created_at
    FROM [dbo].[responses] r
    LEFT JOIN [dbo].[participants] p ON r.[submission_id] = p.[submission_id]
    LEFT JOIN [dbo].[questions] q ON r.[question_id] = q.[question_id];
    """,
    
    # View for sentiment summary
    """
    IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[vw_sentiment_summary]'))
        DROP VIEW [dbo].[vw_sentiment_summary];
    """,
    """
    CREATE VIEW [dbo].[vw_sentiment_summary] AS
    SELECT 
        [question_id],
        COUNT(*) AS total_responses,
        SUM(CASE WHEN [sentiment] = 'positive' THEN 1 ELSE 0 END) AS positive_count,
        SUM(CASE WHEN [sentiment] = 'negative' THEN 1 ELSE 0 END) AS negative_count,
        SUM(CASE WHEN [sentiment] = 'neutral' THEN 1 ELSE 0 END) AS neutral_count,
        SUM(CASE WHEN [sentiment] = 'mixed' THEN 1 ELSE 0 END) AS mixed_count,
        AVG([sentiment_confidence]) AS avg_confidence,
        SUM(CASE WHEN [processed] = 1 THEN 1 ELSE 0 END) AS processed_count,
        SUM(CASE WHEN [processed] = 0 THEN 1 ELSE 0 END) AS pending_count
    FROM [dbo].[responses]
    GROUP BY [question_id];
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
