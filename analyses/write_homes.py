import subprocess   
import argparse
import json
import sys
from pathlib import Path
from database import (
    create_connection,
    create_table,
    select_row_from_ads,
    insert_homes
)
from ad_extraction import get_meta_tags_from_html


# Get the row_id of the newly added row
parser = argparse.ArgumentParser()
parser.add_argument('-d', type=str, help='date and time of scrape')
parser.add_argument('-f', type=str, help='filename of HTML of site')
parser.add_argument('-n', type=str, help='name of site')
parser.add_argument('-u', type=str, help='URL of site')
parser.add_argument('-i', type=str, help='id of the row to gather urls from')
args = parser.parse_args()
filename = args.f
date = filename.split('.')[0]
name = args.n
url = args.u
row_id = args.i

print(f'name: {name}')
print(f'date: {date}')
print(f'url: {url}')
print(f'row_id: {row_id}')

# Open file and analyze for tags
analysis_path = Path.cwd() / 'analyses' / 'sites' / name / 'scraped_ad_sources'
html_path = analysis_path / 'sources' / filename

# Get tags
tags = get_meta_tags_from_html(html_path)

# Establish connection with database
db_file = Path.cwd() / 'analyses' / 'scrapes.db'

# Create homes table if it doesn't exist
sql_create_homes_table = """
    CREATE TABLE IF NOT EXISTS homes (
        id integer PRIMARY KEY,
        scrape_id integer NOT NULL,
        name text NOT NULL,
        date text NOT NULL,
        url text NOT NULL,
        filename text NOT NULL,
        keywords text,
        description text,
        title text,
        og_title text,
        og_site_name text,
        og_description text,
        twitter_keywords text,
        twitter_description text,
        twitter_title text,
        twitter_site text,
        FOREIGN KEY(scrape_id) REFERENCES ads(id) 
    )
    """

conn = create_connection(db_file)
if conn is not None:
    create_table(conn, sql_create_homes_table)
else:
    print('database connection error')
    sys.exit(1)

# Append tags to homes table
insert_homes(conn, row_id, date, name, url, filename, tags)