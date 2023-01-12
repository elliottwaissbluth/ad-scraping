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
parser.add_argument('-f', type=str, help='file path of HTML of site')
parser.add_argument('-d', type=str, help='date of original scrape')
parser.add_argument('-n', type=str, help='name of site')
parser.add_argument('-u', type=str, help='URL of site')
parser.add_argument('-i', type=str, help='id of the row to gather urls from')
args = parser.parse_args()
html_path = args.f
date = args.d
name = args.n
url = args.u
row_id = args.i

# Get tags
tags = get_meta_tags_from_html(html_path)

# Establish connection with database
db_file = Path.cwd() / 'analyses' / 'scrapes.db'
conn = create_connection(db_file)
if conn is None:
    raise RuntimeError('Database connection error, could not perform \
        secondary scrape')

# Append tags to homes table
insert_homes(conn, row_id, date, name, url, html_path, tags)