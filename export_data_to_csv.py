import sqlite3
import csv

def export_database_to_csv():
    '''Exports the two tables in scrapes.db as CSVs, stored at:
    ad-scraping / CSVs
    
    Written by ChatGPT
    '''
    # Connect to the database
    conn = sqlite3.connect('analyses/scrapes.db')

    # Get a cursor
    cur = conn.cursor()

    # List all the tables in the database
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")

    # Iterate over the tables and export each one to a CSV file
    for table_name in cur.fetchall():
        # Open a CSV file for writing
        with open(f'CSVs/{table_name[0]}.csv', 'w') as csv_file:
            # Create a new CSV writer
            writer = csv.writer(csv_file)

            # Execute a SELECT statement to get all the rows from the table
            cur.execute(f'SELECT * FROM {table_name[0]}')

            # Get the column names from the table
            column_names = [description[0] for description in cur.description]

            # Write the column names as the header row of the CSV file
            writer.writerow(column_names)

            # Write the rows to the CSV file
            writer.writerows(cur.fetchall())

    # Close the cursor and the connection to the database
    cur.close()
    conn.close()

if __name__ == '__main__':
    export_database_to_csv()