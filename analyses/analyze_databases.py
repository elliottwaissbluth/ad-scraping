import sqlite3
import pandas as pd

def print_table(db_file, table_name):
    """Prints the table specified by db_file and table name using Pandas
    
    Args:
        db_file (path): Path to sqlite3 database (probably scrapes.db)
        table_name (str): Name of table within database to print
    """
    conn = sqlite3.connect(str(db_file))
    print(pd.read_sql_query(f'SELECT * FROM {table_name}', conn))