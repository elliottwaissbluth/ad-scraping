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


# Get the row_id of the newly added row
parser = argparse.ArgumentParser()
parser.add_argument('-i', type=str, help='id of the row to gather urls from')
args = parser.parse_args()
row_id = args.i

# Establish database connection
db_path = Path.cwd() / 'analyses' /'scrapes.db'
conn = create_connection(db_path)

# Get the row data from the ads table in scrapes.db
row_data = select_row_from_ads(conn, row_id)

# Create queue of sites to visit from row_data
queue = create_queue_from_ads_row(row_data)

print(f'queue: {queue}')

# Using the queue from row_data, set off successive scrapes of ad urls
for i, scrape in enumerate(queue):
        # Run scraper
        cmd = ['python3', 'scrape_homes.py', 
                '-u', scrape['url'], 
                '-n', scrape['name'], 
                '-d', scrape['date']]
        p = subprocess.Popen(cmd).wait()
    
        # Define paths
        datadir_path = Path.cwd() / 'datadir' / scrape['name'] / 'scraped_ad_sources'
        analysis_path = Path.cwd() / 'analyses' / 'sites' / scrape['name'] / 'scraped_ad_sources'

        # Check to see whether scrape was successful, move files if so
        if os.listdir(datadir_path / 'sources'):

                # Rename HTML file and move to analyses / site / <site name> / 
                #   scraped_ad_sources / <date of original scrape>.html
                files = os.listdir(datadir_path / 'sources')
                filename = [x for x in files if len(x) > 23][0] 
                original_path = datadir_path / 'sources' / filename 
                new_path = analysis_path / 'sources' / (str(i) + '_' + filename[-24:])
                cmd = ['mv', str(original_path), str(new_path)]
                p = subprocess.Popen(cmd).wait()

                # Analyze HTML and add results to homes table in scrapes.db
                cmd = ['python3', 'analyses/write_homes.py', 
                        '-f', str(i) + '_' + filename[-24:],
                        '-n', scrape['name'],
                        '-u', scrape['url'],
                        '-i', row_id]
                p = subprocess.Popen(cmd).wait()
        else:
                print('unsuccessful')