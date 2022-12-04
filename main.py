import subprocess
import time
from pathlib import Path
from multiprocessing import Process
import pandas as pd
from analyses.database import (
    create_connection,
    select_scrape_ids
)

def scrape_sources(name, url):
    # Start extract.py to scrape a single site
    print(f'\nBEGINNING PRIMARY SCRAPE FOR {name}\n')
    cmd = ['python3', 'extract.py', '-n', name, '-u', url]
    p = subprocess.Popen(cmd).wait()
    

def scrape_homes(row_id):
    # Start extract_homes.py to do a secondary scrape for a single site
    print(f'\nBEGINNING SECONDARY SCRAPE FOR ROW {row_id}\n')
    cmd = ['python3', 'extract_homes.py', '-i', str(row_id)]
    p = subprocess.Popen(cmd).wait()
    
    
def main():
    
    db_file = Path.cwd() / 'analyses' / 'scrapes.db'

    # Load list of sources from sources.csv
    df = pd.read_csv('sources.csv', header=0)
    sites = list(zip(df.name, df.url))
    print(f'sites: {sites}')
     
    # Create a list of processes
    source_processes = [Process(target=scrape_sources, args=s) for s in sites]
                 
    # Execute processes in a loop
    # for p in source_processes:
        # p.start()
    
    # for p in source_processes:
        # p.join()
    source_processes[0].start()
    source_processes[0].join()

    if True:
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


if __name__ == '__main__':
    main()
    