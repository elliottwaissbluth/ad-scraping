import subprocess
import time
import os

# Run scraper
cmd = ['python3', 'scrape_skynews.py']
p = subprocess.Popen(cmd).wait()

# Unzip .gz file
files = os.listdir('datadir/skynews/sources')
name = [x for x in files if len(x) > 23][0] # Extract long name
gz_path = 'datadir/skynews/sources/' + name

cmd = ['gzip', '-d', gz_path]
p = subprocess.Popen(cmd).wait()

# Rename JSON file and move to analyses folder
files = os.listdir('datadir/skynews/sources')
name = [x for x in files if len(x) > 23][0] # Extract long name
json_path = 'datadir/skynews/sources/' + name 
new_path = 'analyses/skynews_sources/' + name[-24:] # Shorten to date-time

cmd = ['mv', json_path, new_path]
p = subprocess.Popen(cmd).wait()

# Parse JSON file and append results to skynews_sources.txt
cmd = ['python3', 'analyses/write.py', '-n', name[-24:]]
p = subprocess.Popen(cmd).wait()

# Rename .png file and move to screenshots folder
files = os.listdir('datadir/skynews/screenshots')
name = [x for x in files if len(x) > 23][0] # Extract long name
png_path = 'datadir/skynews/screenshots/' + name 
new_path = 'analyses/screenshots/' + name[-23:] # Shorten to date-time

cmd = ['mv', png_path, new_path]
p = subprocess.Popen(cmd).wait()

