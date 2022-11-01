import argparse
import json
import sys
from pathlib import Path

# Database table creation
# Establish connection with database
db_file = Path.cwd() / 'analyses' / 'scrapes.db'

# Create homes table if it doesn't exist
sql_create_homes_table = None

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
row_data = None

# Using the row data, set off successive scrapes of ad urls
# NOTE: Insert subprocess command to extract_homes.py in a for loop
# Within the for loop:
#   scrape the site and move to analyses folder
#   if the scrape was successful (see if the file is in analysis):
#      extract relevant information from html file
#      open connection to "homes" table and insert information
