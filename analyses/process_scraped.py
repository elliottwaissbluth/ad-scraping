import sqlite3
from sqlite3 import Error
from pathlib import Path
from database import (
    create_connection,
    select_scrape_ids
)

db_path = Path.cwd() / 'scrapes.db'

conn = create_connection(db_path)

select_scrape_ids(conn)

# Next, we will create a "homes" table if it doesn't exist already
create_homes_table_sql = """
    CREATE TABLE IF NOT EXISTS homes (
        id integer PRIMARY KEY,
        scrape_id integer NOT NULL,
        url text NOT NULL,
        FOREIGN KEY(scrape_id) REFERENCES ads(id)
    );
    """