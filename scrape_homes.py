from pathlib import Path
from custom_command import LinkCountingCommand
from openwpm.command_sequence import CommandSequence
from openwpm.commands.browser_commands import GetCommand, DumpPageSourceCommand
from openwpm.config import BrowserParams, ManagerParams
from openwpm.storage.sql_provider import SQLiteStorageProvider
from openwpm.task_manager import TaskManager
import argparse
import os
from pathlib import Path
import ast
import sys

# # Get url to scrape from argparse
parser = argparse.ArgumentParser()
parser.add_argument('-s', type=str, help='dict of queue_IDs and urls to scrape')
args = parser.parse_args()
to_scrape = ast.literal_eval(args.s)
to_scrape = {v: k for k, v in to_scrape.items()}
sites = list(to_scrape.keys())

# Path in OpenWPM data_directory
datadir_path = Path.cwd() / 'datadir' / 'scraped_ad_sources'
if not datadir_path.exists():
    os.mkdir(datadir_path)
    os.mkdir(datadir_path / 'sources')
    os.mkdir(datadir_path / 'screenshots')

NUM_BROWSERS = min(16, len(sites))

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

def get_suffix(url, to_scrape):
    '''Produces an identifying suffix to tag onto the saved html file for future
    processing. Creates the suffix in the following form:
    
    __<ID>__
    
    Args:
        url (str): url of site being scraped
        to_scrape(dict[str:str]): dict with key:value url:ID
    
    Returns:
        str: suffix in form __<ID>__
    '''
    return '__' + to_scrape[url] + '__'

# Commands time out by default after 60 seconds
with TaskManager(
    manager_params,
    browser_params,
    SQLiteStorageProvider(Path("./datadir/crawl-data.sqlite")),
    None,
) as manager:
    # Visits the sites
    for index, site in enumerate(sites):

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
        # Start by visiting the page
        command_sequence.append_command(GetCommand(url=site, sleep=20), timeout=180)
        command_sequence.append_command(DumpPageSourceCommand(suffix=get_suffix(site, to_scrape)), timeout=180)

        # Run commands across all browsers (simple parallelization)
        manager.execute_command_sequence(command_sequence)
