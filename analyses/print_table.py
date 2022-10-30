import sqlite3
import pandas as pd

conn = sqlite3.connect('scrapes.db')

def get_ads(conn):
    print(pd.read_sql_query("SELECT * FROM ads", conn))

get_ads(conn)