import subprocess
import time
import os
import pandas as pd
from pathlib import Path
import argparse
import sys

# # Get list of sites to scrape
# df = pd.read_csv('sources.csv', header=0)
# sites = dict(zip(df.name, df.url))

# Get the site name and url to scrape
parser = argparse.ArgumentParser()
parser.add_argument('-n', type=str, help='name of site')
parser.add_argument('-u', type=str, help='URL of site')
args = parser.parse_args()
name = args.n
url = args.u
    
# Define paths
datadir_path = Path.cwd() / 'datadir' / name
analysis_path = Path.cwd() / 'analyses' / 'sites' / name

# Run scraper
cmd = ['python3', 'scrape.py', '-n', name, '-u', url]
p = subprocess.Popen(cmd).wait()

# Unzip .gz file
files = os.listdir(datadir_path / 'sources')
if not files: # If the scrape failed
    sys.exit(0)
filename = [x for x in files if len(x) > 23][0] # Extract long filename
gz_path = datadir_path / 'sources' / filename
cmd = ['gzip', '-d', str(gz_path)]
p = subprocess.Popen(cmd).wait()

# Refilename JSON file and move to analyses / site / <site name> folder
files = os.listdir(datadir_path / 'sources')
filename = [x for x in files if len(x) > 23][0] # Extract long filename
json_path = datadir_path / 'sources' / filename 
new_path = analysis_path / 'sources' / filename[-24:] # Shorten to date-time
cmd = ['mv', str(json_path), str(new_path)]
p = subprocess.Popen(cmd).wait()

# Parse JSON file and append results to sources.txt
cmd = ['python3', 'analyses/write.py', 
        '-d', filename[-24:],
        '-f', str(analysis_path),
        '-n', name]
p = subprocess.Popen(cmd).wait()

# Refilename .png file and move to screenshots folder
files = os.listdir(datadir_path / 'screenshots')
filename = [x for x in files if len(x) > 23][0] # Extract long filename
png_path = datadir_path / 'screenshots' / filename
new_path = analysis_path / 'screenshots' / filename[-23:] # Shorten
cmd = ['mv', str(png_path), str(new_path)]
p = subprocess.Popen(cmd).wait()

