"""
Database helper for Azure SQL connectivity using pytds.
Pure Python TDS implementation that works in Azure Functions managed environment.
"""

import os
import pytds
import logging

def get_connection():
    """
    Get a database connection using pytds.
    Parses the ODBC-style connection string and extracts components.
    """
    conn_string = os.environ.get('SqlConnectionString', '')
    
    if not conn_string:
        raise ValueError("SqlConnectionString not configured")
    
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
        raise ValueError(f"Missing connection parameters. Server: {bool(server)}, DB: {bool(database)}, User: {bool(user)}, Pwd: {bool(password)}")
    
    logging.info(f"Connecting to SQL Server: {server}, Database: {database}")
    
    return pytds.connect(
        dsn=server,
        user=user,
        password=password,
        database=database
    )
