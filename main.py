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
    # Start extract.py to begin pipeline
    print(f'\nBEGINNING PRIMARY SCRAPE FOR\n~~~~~~~~~~~~~~~~~~~~~\n{sites}\n')
    
    # Convert sites to string to send over in argument
    sites = json.dumps(sites)
    
    # Terminal command
    cmd = ['python3', 'extract.py', '-s', sites]
    p = subprocess.Popen(cmd).wait()
    

def scrape_homes(secondary_ids):
    '''Sets the secojnd level site scraping pipeline in motion by calling 
    extract_homes.py on all the sites found in the rows of the ads table with
    id in secondary_ids
    
    Args:
        secondary_ids (List[int]): A list of the IDs found in the ads
            table but not linked to by the scrape_ID column of the homes table.
            Basically it's just all the new scrapes that haven't been addressed
            by the secondary scraper yet.  
    '''
    print(f'\nBEGINNING SECONDARY SCRAPE FOR ROWS\n {secondary_ids}\n')
    
    # Construct string of list to pass as input to extract_homes.py
    ids = '['
    for i in secondary_ids:
        ids += f'"{i}", '
    ids = ids[:-2] + ']'

    # Terminal command
    cmd = ['python3', 'extract_homes.py', '-i', ids]
    p = subprocess.Popen(cmd).wait()
    
    
def main():
    # Check for database 
    db_file = Path.cwd() / 'analyses' / 'scrapes.db'
    if not db_file.exists():
        raise FileNotFoundError('Please initialize the database by creating \
            the file "scrapes.db" in the analyses folder')

    # Check if tables exist, create them if they don't
    conn = create_connection(db_file)
    if conn is not None: # ads table
        create_table(conn, SQL_CREATE_ADS_TABLE)
        create_table(conn, SQL_CREATE_HOMES_TABLE)
    else:
        raise RuntimeError('Database connection error, could not create tables')
    conn.close()

    # Load list of sources from sources.csv
    csv_file = Path.cwd() / 'sources.csv'
    if not csv_file.exists():
        raise FileNotFoundError('Please place the sites to scrape in a CSV \
            titled "sources.csv" and place it in the ad-scraping directory')
    df = pd.read_csv(csv_file, header=0)
    sites = dict(zip(df.name, df.url))
     
    # Send all sites to extract.py
    scrape_sources(sites)

    # Get new row_ids when processes finish
    conn = create_connection(db_file)
    if conn is not None:
        # Get the scrapes from source and the ones already in homes
        source_ids = select_scrape_ids(conn, table='ads')
        homes_ids = select_scrape_ids(conn, table='homes')
        conn.close()

        # The new scrapes are the difference between these scrapes
        secondary_ids = list(source_ids - homes_ids)
        if secondary_ids:
            scrape_homes(secondary_ids)
    else:
        raise RuntimeError('Database connection error, could not perform \
            secondary scrape')
    

if __name__ == '__main__':
    main()
    