from pathlib import Path
from datetime import datetime

from custom_command import LinkCountingCommand
from openwpm.command_sequence import CommandSequence
from openwpm.commands.browser_commands import GetCommand,                      \
                                              DumpPageSourceCommand,           \
                                              RecursiveDumpPageSourceCommand,  \
                                              ScreenshotFullPageCommand
from openwpm.config import BrowserParams, ManagerParams
from openwpm.storage.sql_provider import SQLiteStorageProvider
from openwpm.task_manager import TaskManager
import argparse
import os
import ast
import sys
from pathlib import Path

# Get url to scrape from argparse
parser = argparse.ArgumentParser()
parser.add_argument('-s', type=str, help='dictionary of site names/urls')
args = parser.parse_args()
sites = ast.literal_eval(args.s)

print('in scrape!')
print(sites)

# Get names and urls from sites dictionary
names = list(sites.keys())
urls  = list(sites.values())

print(names)
print(urls)

# Create directories for the site in the analysis folder if it doesn't exist
# Path in analyses folder
analysis_paths = [Path.cwd()/'analyses'/'sites'/name for name in names]
for p in analysis_paths:
    if not p.exists():
        os.mkdir(p)
        os.mkdir(p / 'sources')
        os.mkdir(p / 'screenshots')
# Path in OpenWPM data_directory
datadir_path = Path.cwd() / 'datadir'
if not datadir_path.exists():
    os.mkdir(datadir_path)
    os.mkdir(datadir_path / 'sources')
    os.mkdir(datadir_path / 'screenshots')


NUM_BROWSERS = 4

# Loads the default ManagerParams
# and NUM_BROWSERS copies of the default BrowserParams
manager_params = ManagerParams(num_browsers=NUM_BROWSERS)

# Custom browser_params for bot mitigation and headless browsing (default)
bp = {
    'display_mode' : 'headless',
    'bot_mitigation' : True
}
browser_params = [BrowserParams(**bp) for _ in range(NUM_BROWSERS)]

# Update browser configuration (use this for per-browser settings)
for browser_param in browser_params:
    # Record HTTP Requests and Responses
    browser_param.http_instrument = False
    # Record cookie changes
    browser_param.cookie_instrument = False
    # Record Navigations
    browser_param.navigation_instrument = False
    # Record JS Web API calls
    browser_param.js_instrument = False
    # Record the callstack of all WebRequests made
    browser_param.callstack_instrument = False
    # Record DNS resolution
    browser_param.dns_instrument = False

# Update TaskManager configuration (use this for crawl-wide settings)
manager_params.data_directory = datadir_path
manager_params.log_path = Path("./datadir/openwpm.log")

# memory_watchdog and process_watchdog are useful for large scale cloud crawls.
# Please refer to docs/Configuration.md#platform-configuration-options for more information
# manager_params.memory_watchdog = True
# manager_params.process_watchdog = True

def get_suffix(url, sites):
    '''Uses name, current date and time as string as suffix. Gathers name by
    reverse searching the sites dictionary.
    
    Suffix structure:
    __<name>__<current date and time>
    '''
    name = [x for x in sites if sites[x] == url]
    name = name[0]
    now = datetime.now()
    now = now.strftime('%Y-%m-%d-%H-%M-%S')
    suffix = f'__{name}__{now}'
    print(f'suffix !! : {suffix}')

    return suffix


# Commands time out by default after 60 seconds
with TaskManager(
    manager_params,
    browser_params,
    SQLiteStorageProvider(Path("./datadir/crawl-data.sqlite")),
    None,
) as manager:
    # Visits the sites
    for index, site in enumerate(urls):

        def callback(success: bool, val: str = site) -> None:
            print(
                f"CommandSequence for {val} ran {'successfully' if success else 'unsuccessfully'}"
            )

        # Parallelize sites over all number of browsers set above.
        command_sequence = CommandSequence(
            site,
            site_rank=index,
            callback=callback,
            reset=True
        )
        suffix = get_suffix(site, sites)
        # Start by visiting the page
        command_sequence.append_command(GetCommand(url=site, sleep=20), timeout=180)
        command_sequence.append_command(RecursiveDumpPageSourceCommand(suffix=suffix), timeout=180)
        command_sequence.append_command(ScreenshotFullPageCommand(suffix=suffix))

        # Run commands across all browsers (simple parallelization)
        manager.execute_command_sequence(command_sequence)
