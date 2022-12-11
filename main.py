import subprocess
import time
import json
import sys
from pathlib import Path
from multiprocessing import Process
import pandas as pd
from analyses.database import (
    create_connection,
    select_scrape_ids,
    create_table
)

SQL_CREATE_ADS_TABLE = """
CREATE TABLE IF NOT EXISTS ads (
    id integer PRIMARY KEY,
    date text NOT NULL,
    name text NOT NULL,
    source_file text NOT NULL,
    screenshot_file text NOT NULL,
    backend_mobile_detect integer,
    backend_geo_country text,
    backend_geo_region text,
    backend_geo_city text,
    backend_geo_lat real,
    backend_geo_long real,
    backend_geo_tmz text,
    backend_geo_network text,
    gdpr_user integer,
    mfSponsor text,
    p_tags text,
    adurls text,
    destinationUrl text
);
"""

SQL_CREATE_HOMES_TABLE = """
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

def scrape_sources(sites):
    '''Sets the top level site scraping pipeline in motion by calling extract.py
    on all the websites listed in the sites dictionary
    
    Args:
        sites (dict[str:str]): key : value pairs are <site name> : <site url>
    '''
    # Start extract.py to scrape a single site
    print(f'\nBEGINNING PRIMARY SCRAPE FOR\n~~~~~~~~~~~~~~~~~~~~~\n{sites}\n')
    
    # Convert sites to string to send over in argument
    sites = json.dumps(sites)
    
    # start scraping all sites
    cmd = ['python3', 'extract.py', '-s', sites]
    p = subprocess.Popen(cmd).wait()
    

def scrape_homes(row_id):
    # Start extract_homes.py to do a secondary scrape for a single site
    print(f'\nBEGINNING SECONDARY SCRAPE FOR ROW {row_id}\n')
    cmd = ['python3', 'extract_homes.py', '-i', str(row_id)]
    p = subprocess.Popen(cmd).wait()
    
    
def main():
    
    db_file = Path.cwd() / 'analyses' / 'scrapes.db'

    # Check to see if tables exist, create them if they don't
    conn = create_connection(db_file)
    # ads table
    if conn is not None:
        create_table(conn, SQL_CREATE_ADS_TABLE)
    else:
        print('database connection error')
        sys.exit(1)
    # homes table 
    if conn is not None:
        create_table(conn, SQL_CREATE_HOMES_TABLE)
    else:
        print('database connection error')
        sys.exit(1)
    conn.close()

    # Load list of sources from sources.csv
    df = pd.read_csv('sources.csv', header=0)
    sites = dict(zip(df.name, df.url))
    print(f'sites: {sites}')
     
    # Send all sites to extract.py
    scrape_sources(sites)
    sys.exit(0)

    # Get new row_ids when processes finish
    # Create connection to database
    conn = create_connection(db_file)
    if conn is not None:
        # Get the scrapes from source and the ones already in homes
        source_ids = select_scrape_ids(conn, table='ads')
        homes_ids = select_scrape_ids(conn, table='homes')
        conn.close()
    else:
        print('database connection error')
        # continue
    
    # The new scrapes are the difference between these scrapes
    secondary_ids = list(source_ids - homes_ids)
    print(f'secondary_ids: {secondary_ids}')
    
    # Start a new process for each id in secondary_ids
    homes_processes = [Process(target=scrape_homes, args=(i,)) 
                        for i in secondary_ids]
    
    # Execute homes processes
    for q in homes_processes:
        q.start()
        # q.join()


if __name__ == '__main__':
    main()
    