import subprocess
import time
import os
import pandas as pd
from pathlib import Path
import argparse
import sys
import ast
import re
from utils import get_double_underscore_string


# Get the site name and url to scrape
parser = argparse.ArgumentParser()
parser.add_argument('-s', type=str, help='dictionary of site names/urls')
args = parser.parse_args()
sites = ast.literal_eval(args.s)

# Separate names of sites from URLs, pass each to scrape.py
names = list(sites.keys())
urls = list(sites.values())

# Run scraper
cmd = ['python3', 'scrape.py', '-s', args.s]
p = subprocess.Popen(cmd).wait()

# Define paths to data directory, analyses folders for each site
datadir_path = Path.cwd() / 'datadir' 
analysis_path = Path.cwd() / 'analyses' / 'sites'
analysis_paths = {f'__{name}__' : analysis_path / name for name in names}

# Unzip .gz files from sources folder and move them to analyses folders
# Get paths of .gz files
files = os.listdir(datadir_path / 'sources')
filenames = [x for x in files if len(x) > 23] # Extract long filenames
gz_paths = [datadir_path / 'sources' / f for f in filenames]
for gz_file in gz_paths: # for each zipped HTML
    cmd = ['gzip', '-d', str(gz_file)] # Unzip .gz file with terminal command 
    p = subprocess.Popen(cmd).wait()
    
    # Move to appropriate folder in analyses/sites
    json_path = Path(str(gz_file)[:-3])  # full json path
    json_file = json_path.parts[-1]      # json file name
    new_filename = json_file[-24:]       # shortened json file name
    
    # Define analysis path
    # Get part of json file name surrounded by double underscore __<name>__
    name = get_double_underscore_string(json_file)
    analysis_path = analysis_paths[name]
    if not Path(analysis_path).exists():  # create directories if they don't exist
        os.mkdir(analysis_path)
        os.mkdir(Path(analysis_path) / 'sources')
        os.mkdir(Path(analysis_path) / 'screenshots')
    
    # Define destination path, where the unzipped .gz file is going
    new_path = analysis_path / 'sources' / new_filename

    # Move file to analyses folder
    cmd = ['mv', str(json_path), str(new_path)]
    p = subprocess.Popen(cmd).wait()

    # Parse JSON file and append results to database
    cmd = ['python3', 'analyses/write.py', 
            '-d', new_filename,
            '-f', str(analysis_path),
            '-n', name.strip('_')]
    p = subprocess.Popen(cmd).wait()

# Time to deal with screenshots
# Rename .png file and move to screenshots folder
files = os.listdir(datadir_path / 'screenshots')
filenames = [x for x in files if len(x) > 23] # Extract long filename
png_paths = [datadir_path / 'screenshots' / f for f in filenames]
for png in png_paths:
    png_file = png.parts[-1]      # png file name
    new_filename = png_file[-23:] # shortened png file name
    
    # analysis folder path, indexed by dictionary defined above
    # Get part of png file name surrounded by double underscore __<name>__
    name = get_double_underscore_string(png_file)
    analysis_path = analysis_paths[name]
    
    # destination path 
    new_path = analysis_path / 'screenshots' / new_filename

    # Move file to analyses folder
    cmd = ['mv', str(png), str(new_path)]
    p = subprocess.Popen(cmd).wait()