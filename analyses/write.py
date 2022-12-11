import argparse
import json
import sys
import re
from pathlib import Path
from ad_extraction import (
    get_text_from_json,
    get_adurl_from_json,
    get_utag_data_from_json,
    get_destination_url_from_json
)
from database import (
    create_connection,
    create_table,
    insert_scrape
)

# Establish connection with database
db_file = Path.cwd() / 'analyses' / 'scrapes.db'
conn = create_connection(db_file)


# Get date and time from script call
parser = argparse.ArgumentParser()
parser.add_argument('-d', type=str, help='date and time of scrape')
parser.add_argument('-f', type=str, help='analysis folder of site')
parser.add_argument('-n', type=str, help='name of site')
args = parser.parse_args()
date = args.d
analysis_path = args.f
name = args.n
print('!! IN write.py !!')
print(f'date: {date}')
print(f'analysis_path: {analysis_path}')
print(f'name: {name}')

# Open JSON and gather data
json_path = Path(analysis_path) / 'sources' / date
with open(json_path) as f:
    j = json.load(f)
    text = get_text_from_json(j)  # Get text from <p> tags in json
    urls = get_adurl_from_json(j) # Get url from &adurl= hrefs
    utag_data = get_utag_data_from_json(j) # Get geolocation, IP info
    url = get_destination_url_from_json(j) # Get url from destinationUrl tag
    j = str(j)

# find sponsors tagged by mfSponsor tag
sponsor_indices = [x.start() for x in re.finditer('Sponsored by', j)]
sponsors = []
for s in sponsor_indices:
    sponsor = j[s:s+120] # 120 chars should be enough for all sponsors
    end = re.search('<', sponsor).start() # eliminate HTML tags
    sponsor = sponsor[:end]
    sponsor = re.sub('Sponsored by ', '', sponsor)
    sponsors.append(sponsor)

# Write to database
screenshot_path = Path(analysis_path) / 'screenshots' / (date[:-5] + '.png') 
insert_scrape(conn = conn, 
              date = date[:-5], 
              name = name,
              source_file = str(json_path),
              screenshot_file = str(screenshot_path),
              p_tag_text = text,
              adurls = urls,
              utag_data = utag_data,
              destination_url = url,
              mfSponsors = sponsors)