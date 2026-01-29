"""
Database helper for Azure SQL connectivity using pymssql.
Works in Azure Functions managed environment when deployed via GitHub Actions.
"""

import os
import logging

# Try to import pymssql, fall back to None if not available
try:
    import pymssql
    PYMSSQL_AVAILABLE = True
except ImportError:
    PYMSSQL_AVAILABLE = False
    pymssql = None


def get_connection():
    """
    Get a database connection using pymssql.
    Parses the ODBC-style connection string and extracts components.
    
    Returns:
        pymssql connection object
        
    Raises:
        ImportError: If pymssql is not installed
        ValueError: If connection string is missing or invalid
    """
    if not PYMSSQL_AVAILABLE:
        raise ImportError(
            "pymssql is not installed. Deploy via GitHub Actions to enable remote build, "
            "or install manually with: pip install pymssql"
        )
    
    conn_string = os.environ.get('SqlConnectionString', '')
    
    if not conn_string:
        raise ValueError("SqlConnectionString environment variable not configured")
    
    # Parse the connection string
    # Format: Server=tcp:server.database.windows.net,1433;Database=db;User Id=user;Password=pass;...
    parts = {}
    for part in conn_string.split(';'):
        if '=' in part:
            key, value = part.split('=', 1)
            parts[key.strip().lower()] = value.strip()
    
    # Extract server (remove tcp: prefix and port)
    server = parts.get('server', '')
    if server.startswith('tcp:'):
        server = server[4:]
    if ',' in server:
        server = server.split(',')[0]
    
    database = parts.get('database', parts.get('initial catalog', ''))
    user = parts.get('user id', parts.get('uid', ''))
    password = parts.get('password', parts.get('pwd', ''))
    
    if not all([server, database, user, password]):
        raise ValueError(
            f"Missing connection parameters. "
            f"Server: {bool(server)}, DB: {bool(database)}, User: {bool(user)}, Pwd: {bool(password)}"
        )
    
    logging.info(f"Connecting to SQL Server: {server}, Database: {database}")
    
    return pymssql.connect(
        server=server,
        user=user,
        password=password,
        database=database,
        tds_version='7.4'
    )


def is_database_available():
    """Check if database connectivity is available."""
    return PYMSSQL_AVAILABLE and bool(os.environ.get('SqlConnectionString', ''))
