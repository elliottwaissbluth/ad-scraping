import argparse
import json
import sys
from pathlib import Path
from database import (
    create_connection,
    create_table,
    select_row_from_ads
)

# Database table creation
# Establish connection with database
db_file = Path.cwd() / 'analyses' / 'scrapes.db'

# Create homes table if it doesn't exist
sql_create_homes_table = """
    CREATE TABLE IF NOT EXISTS homes (
        id integer PRIMARY KEY,
        scrape_id integer NOT NULL,
        date text NOT NULL,
        url text NOT NULL,
        keywords text,
        description text,
        title text,
        og:title text,
        og:site_name text,
        twitter:keywords text,
        twitter:description text,
        twitter:title text,
        twitter:site text
        FOREIGN KEY(scrape_id) REFERENCES ads(id) 
    )
    """

conn = create_connection(db_file)
if conn is not None:
    create_table(conn, sql_create_ads_table)
else:
    print('database connection error')
    sys.exit(1)

# Get the row_id of the newly added row
parser = argparse.ArgumentParser()
parser.add_argument('-i', type=str, help='id of the row to gather urls from')
args = parser.parse_args()
row_id = args.i

# Get the row data from the ads table in scrapes.db
row_data = select_row_from_ads(conn, row_id)

# Create queue of sites to visit from row_data
queue = create_queue_from_ads_row(row_data)

# Using the queue from row_data, set off successive scrapes of ad urls
# NOTE: Insert subprocess command to extract_homes.py in a for loop
# Within the for loop:
#   scrape the site and move to analyses folder
#   if the scrape was successful (see if the file is in analysis):
#      extract relevant information from html file
#      open connection to "homes" table and insert information
for scrape in queue:
    