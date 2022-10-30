import sqlite3
from sqlite3 import Error
import datetime
from pathlib import Path
import pandas as pd

def create_connection(db_file):
    '''Creates a connection with the database (scrapes.db)
    
    Args:
        db_file (Path): path to sqlite3 database file (scrapes.db)
    
    Returns:
        conn (sqlite3 connection): connection to database
    '''
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)
    
    return None

def create_table(conn, create_table_sql):
    '''Creates a table using create_table_sql.
    
    Args:
        conn (sqlite3 connection): connection to database
        create_table_sql (str): SQL to create table in database
    '''
    try:
        cur = conn.cursor()
        cur.execute(create_table_sql)
        cur.close()
    except Error as e:
        print(e)

def insert_scrape(conn, date, name, source_file, screenshot_file, p_tag_text, 
                  adurls, utag_data, destination_url, mfSponsors):
    '''Inserts data from the scrape of a single site into ads table
    
    Args:
        conn (sqlite3 connection): connection to database
        date (str): date and time of scrape
        name (str): name of site that was scraped
        source_file (str): path to JSON file containing HTML source of site
        screenshot_file (str): path to .png screenshot of site
        p_tag_text (dict{str:List[str]}): text extracted from p tags
            keys: frameID from source_file
            values: list of text extracted from p_tags
        adurls (dict{str:List[str]}): urls extracted from adurls tag
            keys: frameID from source_file
            values: list of text extracted from adurls tag
        utag_data (dict{str:str}): extracted utag data
            keys: utag
            values: data corresponding to utag
        destination_url (str): url extracted from destinationUrl tag
        mfSponsors (List[str]): list of sponsors from mfSponsors tag
    '''
    data = {
        'date' : date,
        'name' : name,
        'source_file' : source_file,
        'screenshot_file' : screenshot_file,
    }
    
    # Parse complex data structures into strings separated by ' || ' 
    if p_tag_text:
        p_tag_text = p_tag_text.values()
        p_tag_text = [p[0] for p in p_tag_text]
        data['p_tags'] = ' || '.join(p_tag_text)

    if adurls:
        adurls = adurls.values()
        adurls = [p[0] for p in adurls]
        data['adurls'] = ' || '.join(adurls)

    if mfSponsors:
        data['mfSponsor'] = ' || '.join(mfSponsors)

    if utag_data:
        for k,v in utag_data.items():
            if k in ['backend_geo_lat', 'backend_geo_long']:
                data[k] = float(v)
            elif k in ['backend_mobile_detect', 'gdpr_user']:
                if v == 'false':
                    data[k] = 0
                else:
                    data[k] = 1
            else:
                data[k] = v
    if destination_url:
        data['destinationUrl'] = destination_url
    
    # Construct data in a format insertable by SQL
    data_to_insert = [v for v in data.values()]
    cols, vals = __get_sql_cols_and_vals_text(data) # column names and values
    
    # Execute insertion and close connections
    sql = f"""
        INSERT INTO ads {cols}
        VALUES {vals}
    """
    cur = conn.cursor()
    cur.execute(sql, data_to_insert)
    conn.commit()
    cur.close()
    conn.close()
    
    
def __get_sql_cols_and_vals_text(data):
    '''Gets column names and values from data to insert into ads table. Helper
    function for insert_scrape()
    
    Args:
        data (dict{str:str}): data to insert into ads
        
    Returns:
        cols (str): str in format "(col1,col2,col3,...,colN)
        vals (str): str in format "(?,?,?,...,?)
    '''
    cols = '('
    vals = '('
    for k,v in data.items():
        cols += k + ','
        vals += '?' + ','
    cols = cols[:-1] + ')'
    vals = vals[:-1] + ')'
    return cols, vals

def print_table(db_file, table_name):
    """Prints the table specified by db_file and table name using Pandas
    
    Args:
        db_file (path): Path to sqlite3 database (probably scrapes.db)
        table_name (str): Name of table within database to print
    """
    conn = sqlite3.connect(str(db_file))
    print(pd.read_sql_query(f'SELECT * FROM {table_name}', conn))
    
# ~~~~~~~~~~~~ exlusively utilized by process_scraped.py ~~~~~~~~~~~~

def select_scrape_ids(conn):
    """Gathers the set of scrape IDs present in the ads table. We will later
    check these against the unique values of the scrape_id column in the 'homes'
    table to see if any new postprocessing scrapes need to be initialized.
    
    Args:
        conn (sqlite3 connection): Connection to scrapes.db
        
    Returns:
        ids (Set(int)): Unique scrape IDs present in the "ads" table.
            NOTE: each ID here corresponds to a single scrape of a single site
    """
    cur = conn.cursor()
    cur.execute(
        """
        SELECT DISTINCT id FROM ads;
        """
    )
    rows = cur.fetchall()

    # get IDs as ints
    ids = set(())
    for row in rows:
        ids.add(row[0])
   
    print(f'IDs present in "ads": {ids}') 
    return ids