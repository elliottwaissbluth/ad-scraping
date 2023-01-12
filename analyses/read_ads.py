import sqlite3
from pathlib import Path
from database import create_connection

def select_row_from_ads(conn, row_id):
    """Selects all the data in the row marked by row_id from the ads table
    
    Args:
        conn (sqlite3 connection): connection to database (probably scrapes.db)
        row_id (int): the ID of the row to select
        
    Returns:
        dict: dictionary with key value pairs the same as the ads schema
    """
    # get row
    cur = conn.cursor()
    cur.execute("SELECT * FROM ads WHERE id=?", (row_id,))
    row = list(cur.fetchall()[0])

    # get column names
    col_names = [description[0] for description in cur.description]
    
    cur.close()

    return dict(zip(col_names, row))