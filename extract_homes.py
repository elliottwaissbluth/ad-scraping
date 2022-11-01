import subprocess
import time
import os
import pandas as pd
from pathlib import Path
import argparse

# Get url to scrape from argparse
parser = argparse.ArgumentParser()
parser.add_argument('-u', type=str, help='url of site to scrape')
parser.add_argument('-n', type=str, help='name of site to scrape')
parser.add_argument('-d', type=str, help='date of original scrape')
args = parser.parse_args()
site = args.u
name = args.n
date = args.d

datadir_path = Path.cwd() / 'datadir' / name / 'scraped_ad_sources'
analysis_path = Path.cwd() / 'analyses' / 'sites' / name / 'scraped_ad_sources'

# Run scraper
cmd = ['python3', 'scrape_homes.py', '-n', name, '-u', url, '-d', date]
p = subprocess.Popen(cmd).wait()

# Check to see whether scrape was successful, move files if so
if os.listdir(datadir_path / 'sources'):

    # Rename HTML file and move to analyses / site / <site name> / 
    #   scraped_ad_sources / <date of original scrape>.html
    files = os.listdir(datadir_path / 'sources')
    filename = [x for x in files if len(x) > 23][0] # Extract long filename
    original_path = datadir_path / 'sources' / filename 
    new_path = analysis_path / 'sources' / filename[-24:] # Shorten to date-time
    cmd = ['mv', str(original_path), str(new_path)]
    p = subprocess.Popen(cmd).wait()

    # Analyze HTML and add results to homes table in scrapes.db
    cmd = ['python3', 'analyses/write_homes.py', 
            '-d', filename[-24:],
            '-f', str(analysis_path),
            '-n', name]
    p = subprocess.Popen(cmd).wait()