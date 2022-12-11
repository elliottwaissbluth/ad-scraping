import sqlite3
from sqlite3 import Error
import datetime
from pathlib import Path

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
    

def insert_homes(conn, scrape_id, date, name, url, filename, tags): 
    '''Inserts data about home sites of scraped advertisements. Specifically,
    the homes table is for data gathered from resolved links that were 
    originally scraped from an advertisement.
    
    Args:
        • conn (sqlite3 connection): connection to database
        • scrape_id (str) : primary key ID from ads table
        • date (str) : date of original scrape
        • name (str) : name of top level URL
        • url (str) : url scraped from advertisement found at <name>
        • tags (dict{str:str}): scrape_id is an int, the rest are strings
            scrape_id (int) : ID of primary scrape
            date (str) : date of original top level scrape
            url  (str) : url of original top level scrape
            keywords (str) : meta_tag
            description (str) : meta_tag
            title (str) : meta_tag
            og:title (str) : meta_tag
            og:site_name (str) : meta_tag
            twitter:keywords (str) : meta_tag
            twitter:description (str) : meta_tag
            twitter:title (str) : meta_tag
            twitter:site (str) : meta_tag
        • TODO: resolved_url: TODO
    '''
    # data will be passed to __get_sql_cols_and_vals_text() to get an insertable
    # string for the homes table 
    data = {
        'scrape_id' : scrape_id,
        'date' : date,
        'name' : name,
        'url' : url,
        'filename' : filename,
    }
    for k,v in tags.items():
        data[k] = v
    
    # Construct data in a format insertable by SQL
    data_to_insert = [v for v in data.values()]
    cols, vals = __get_sql_cols_and_vals_text(data) # column names and values
    
    # Execute insertion and close connections
    sql = f"""
        INSERT INTO homes {cols}
        VALUES {vals}
    """
    print(f'homes sql: {sql}')
    print(f'data_to_insert: {data_to_insert}')
    cur = conn.cursor()
    cur.execute(sql, data_to_insert)
    conn.commit()
    cur.close()
    conn.close()
    
def __get_sql_cols_and_vals_text(data):
    '''Gets column names and values from data to insert into tables. Helper
    function for insert_scrape() and insert_homes()
    
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

    

# ~~~~~~~~~~~~~~~~~ exlusively utilized by process_scraped.py ~~~~~~~~~~~~~~~~~

def select_scrape_ids(conn, table = 'ads'):
    """Scrapes the 'ID' column of ads. We will use this data to see if there are
    new entries to the database that need set off secondary scraping processes.
    
    Args:
        conn (sqlite3 connection): Connection to scrapes.db
        
    Returns:
        ids (Set(int)): Unique scrape IDs present in the "ads" table.
            NOTE: each ID here corresponds to a single scrape of a single site
    """
    cur = conn.cursor()
    if table == 'ads':
        cur.execute(f'SELECT DISTINCT id FROM ads;')
    elif table == 'homes':
        cur.execute(f'SELECT DISTINCT scrape_id FROM homes;')
    rows = cur.fetchall()

    # get IDs as ints
    ids = set(())
    for row in rows:
        ids.add(row[0])
   
    # close cursor
    cur.close()

    print(f'IDs present in "{table}": {ids}') 
    return ids

def select_row_from_ads(conn, row_id):
    """Selects all the data in the row marked by row_id from the ads table
    
    Args:
        conn (sqlite3 connection): connection to database (probably scrapes.db)
        row_id (int): the ID of the row to select
        
    Returns:
        dict: dictionary with key value pairs
            column name (str) : value
    """
    # get row
    cur = conn.cursor()
    cur.execute("SELECT * FROM ads WHERE id=?", (row_id,))
    row = list(cur.fetchall()[0])

    # get column names
    col_names = [description[0] for description in cur.description]
    
    cur.close()

    return dict(zip(col_names, row))