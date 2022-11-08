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

# # Get url to scrape from argparse
# parser = argparse.ArgumentParser()
# parser.add_argument('-u', type=str, help='url of site to scrape')
# parser.add_argument('-n', type=str, help='name of site ad was scraped from')
# parser.add_argument('-d', type=str, help='date of original scrape')
# args = parser.parse_args()
# sites = [args.u]
# name = args.n
# date = args.d

# FOR PROTOTYPING
sites = ['https://betterprogramming.pub/introduction-to-message-queue-with-rabbitmq-python-639e397cb668']
name = 'test'
date = '2022-10-23-14-54-12'

# Create directories for the site in the analysis folder if it doesn't exist
# Path in analyses folder
analysis_path = Path.cwd() / 'analyses' / 'sites' / name / 'scraped_ad_sources'
if not analysis_path.exists():
    os.mkdir(analysis_path)
    os.mkdir(analysis_path / 'sources')
    os.mkdir(analysis_path / 'screenshots')

# Path in OpenWPM data_directory
datadir_path = Path.cwd() / 'datadir' / name / 'scraped_ad_sources'
if not datadir_path.exists():
    os.mkdir(datadir_path)
    os.mkdir(datadir_path / 'sources')
    os.mkdir(datadir_path / 'screenshots')


NUM_BROWSERS = 1

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
        command_sequence.append_command(GetCommand(url=site, sleep=10), timeout=60)
        command_sequence.append_command(DumpPageSourceCommand(suffix=date), timeout=60)

        # Run commands across all browsers (simple parallelization)
        manager.execute_command_sequence(command_sequence)
