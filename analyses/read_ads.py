import sqlite3
from pathlib import Path
from database import create_connection

def select_row_from_ads(conn, row_id):
    """Selects all the data in the row marked by row_id from the ads table
    
    Args:
        conn (sqlite3 connection): connection to database (probably scrapes.db)
        row_id (int): the ID of the row to select
        
    Returns:
        dict: dictionary with key value pairs
            column name (str) : value
    """
    # get row
    cur = conn.cursor()
    cur.execute("SELECT * FROM ads WHERE id=?", (row_id,))
    row = list(cur.fetchall()[0])

    # get column names
    col_names = [description[0] for description in cur.description]
    
    cur.close()

    return dict(zip(col_names, row))

db_path = Path.cwd() / 'scrapes.db'

conn = create_connection(db_path)

row_data = select_row_from_ads(conn, 1)

def create_queue_from_ads_row(row_data):
    """Takes the data from a row of "ads" and creates a list of URLs  and
    descriptive data to feed into the scraper used to populate "homes".
    
    Args:
        row_data (dict[str : ?]): data from a single row of "ads" table
            NOTE: This is the direct output of select_row_from_ads()
    """
    # Null case
    if row_data['adurls'] is None and row_data['destinationUrl'] is None:
        return None

    # Extract all URLs in row_data
    # URLs may be present in the 'adurls' or 'destinationUrl' columns
    urls = []
    if row_data['adurls'] is not None:
        urls.extend(row_data['adurls'].split(' || '))
    if row_data['destinationUrl'] is not None:
        urls.extend(row_data['destinationUrl'].split(' || '))

    # Remove duplicate URLs
    urls = list(set(urls))
    
    # Create queue with descriptive data for each URL
    queue = [
        {
            'scrape_id' : row_data['id'],
            'date' : row_data['date'],
            'name' : row_data['name'],
            'url' : x    
        } for x in urls
    ]
    
    return queue

queue = create_queue_from_ads_row(row_data)
print(queue)