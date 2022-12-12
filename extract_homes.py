import subprocess
import time
import os
import pandas as pd
from pathlib import Path
import argparse
from analyses.database import (
        select_row_from_ads,
        create_connection
)
from analyses.ad_extraction import create_queue_from_ads_row
from utils import get_double_underscore_string
import ast
import sys
import json


# Get the row_id of the newly added row
parser = argparse.ArgumentParser()
parser.add_argument('-i', type=str, help='ids of the row to gather urls from')
args = parser.parse_args()
row_ids = ast.literal_eval(args.i)

# Establish database connection
db_path = Path.cwd() / 'analyses' /'scrapes.db'
conn = create_connection(db_path)

queues = []
for row_id in row_ids: 
        # Get the row data from the ads table in scrapes.db
        row_data = select_row_from_ads(conn, row_id)
        # Create queue of sites to visit from row_data
        queue = create_queue_from_ads_row(row_data)
        queues.append(queue)
conn.close()
queues = [x for y in queues for x in y]

# print(f'queues: {queues}')

# We will construct an ID for each queue in queues to later identify and save
# by adjusting the suffix
queues_ids = {i: x for i,x in enumerate(queues)}
# print(queues_ids)

# Now we can construct the dictionary {queue_id: url} to send to the scraper
to_scrape = {}
for k,v in queues_ids.items():
        to_scrape[k] = v['url']
to_scrape = json.dumps(to_scrape) # make string for passage as argument
# print(f'to_scrape: {to_scrape}')

# Send to scraper
# TODO re-engage
cmd = ['python3', 'scrape_homes.py', '-s', to_scrape]
p = subprocess.Popen(cmd).wait()

# Parse through datadir, moving and renaming files as needed
datadir = Path.cwd() / 'datadir' / 'scraped_ad_sources' / 'sources'
for html_path in [datadir / x for x in os.listdir(datadir)]:
        # Find info from previously stored data in queue
        queue_id = get_double_underscore_string(html_path.parts[-1]).strip('_')
        scrape = queues_ids[int(queue_id)]
        
        # Define path to move file to 
        analysis_path = Path.cwd() / 'analyses' / 'sites' / scrape['name'] / 'scraped_ad_sources'
        if not analysis_path.exists():
                os.mkdir(analysis_path)
        new_path = analysis_path / (queue_id + '_' + scrape['date'] + '.html')
        
        # Move file
        print(f'html_path: {html_path}')
        print(f'new_path: {new_path}')
        cmd = ['mv', str(html_path), str(new_path)]
        p = subprocess.Popen(cmd).wait()

        # Analyze HTML and add results to homes table in scrapes.db
        cmd = ['python3', 'analyses/write_homes.py',
                '-d', scrape['date'],
                '-f', str(new_path),
                '-n', scrape['name'],
                '-u', scrape['url'],
                '-i', str(scrape['scrape_id'])]
        p = subprocess.Popen(cmd).wait()