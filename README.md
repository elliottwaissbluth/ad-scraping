<a name="readme-top"></a>

# ad-scraping
ad-scraping is a web scraping extension designed to gather information about digital advertisements served on any website.

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

To use ad-scraping, you must have OpenWPM installed. See their [repository](https://github.com/openwpm/OpenWPM#installation) for details.

### Installation

1. [Install OpenWPM](https://github.com/openwpm/OpenWPM#installation)
2. Clone this repo
   ```sh
   git clone https://github.com/elliottwaissbluth/ad-scraping.git
   ```
3. Copy the ad-scraping files from their directory to the ```OpenWPM``` directory.
   ```sh
   cp -a /ad-scraping/. /OpenWPM/
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## Usage

1. Add the websites you want to scrape to ```sources.csv``` and place in the ```OpenWPM``` directory.
2. Activate the ```openwpm``` conda environment.
   ```sh
   conda activate openwpm
   ```
3. Run ```main.py```
   ```sh
   python3 main.py
   ```
4. Wait for scraper to gather data. The scraper will run in a loop until manually stopped with a keyboard interrupt, ```Ctrl+C```, or the system runs out of memory.
5. Export the tables to CSV format.
   ```sh
   python3 export_data_to_csv.py
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- SCHEMA -->
## Schema
scrapes.db contains two tables, **ads** and **homes**.

### ads
Each website in sources.csv will be scraped individually. A row in ```ads``` corresponds to a single scrape of one website from ```sources.csv```. There are four fields related to scraped advertisements, the rest is metadata:
- mfSponsor
- p_tags
- adurls
- destinationURL

All of these fields are gathered by analyzing HTML scraped from each site. See ```analyses/ad_extraction.py``` for more details.

| **field**             | **type** | **description**                                                         |
|-----------------------|----------|-------------------------------------------------------------------------|
| id                    | integer  | ID of scrape.                                                           |
| date                  | text     | Date and time of scrape.                                                |
| name                  | text     | Name of site being scraped.                                             |
| source_file           | text     | File location of scraped HTML.                                               |
| screenshot_file       | text     | File location of screenshot of site.                                         |
| backend_mobile_detect | text     | utag. Whether the site has been visited on mobile.                      |
| backend_geo_country   | text     | utag. Country from which site was visited.                              |
| backend_geo_region    | text     | utag. Region from which site was visited.                               |
| backend_geo_city      | text     | utag. City from which site was visited.                                 |
| backend_geo_lat       | float    | utag. Latitude from which site was visited.                             |
| backend_geo_long      | float    | utag. Longitude from which site was visited.                            |
| backend_geo_tmz       | text     | utag. Time zone from which site was visited                             |
| backend_geo_network   | text     | ISP network from which site was visited.                                 |
| mfSponsor             | text     | Advertisement URL.                                                       |
| p_tags                | text     | Text containing descriptive information about underlying advertisement. |
| adurls                | text     | Advertisement URL.                                                       |
| destinationUrl        | text     | Advertisement URL.                                                       |

### homes
After a row is populated in **ads**, there are three fields (mfSponsor, adurls, and destinationUrl) that might contain links to an advertiser's domain. Sometimes, the URL itself is not descriptive enough to understand what is being advertised or who the advertiser is. To mitigate this knowledge gap, we take the URLs found in these fields and point the scraper towards them. We refer to this as a *secondary scrape* as opposed to the top level *primary scrape* that populated the **ads** table. Note that every scrape in **homes** is linked to a primary scrape in **ads** by the ```scrape_id``` field.

| **field**           | **type** | **description**                                       |
|---------------------|----------|-------------------------------------------------------|
| id                  | int      | ID of scrape.                                         |
| scrape_id           | int      | Foreign key, references "id" in **ads** table.        |
| name                | text     | Name of primary site ad was originally gathered from. |
| date                | text     | Date and time of secondary scrape.                    |
| url                 | text     | URL of site being scraped.                            |
| filename            | text     | File location where HTML is stored.                   |
| keywords            | text     | Content in "keywords" meta tag.                       |
| description         | text     | Content in "description" meta tag.                    |
| title               | text     | Content in "title" meta tag                           |
| og_title            | text     | Content in "og: title" meta tag.                      |
| og_site_name        | text     | Content in "og: site name" meta tag.                  |
| og_description      | text     | Content in "og: description" meta tag.                |
| twitter_keywords    | text     | Content in "twitter: keywords" meta tag.              |
| twitter_description | text     | Content in "twitter: description" meta tag.           |
| twitter_title       | text     | Content in "twitter: title" meta tag.                 |
| twitter_site        | text     | Content in "twitter: site" meta tag.                  |


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- FLOW OF SCRIPTS -->
## Flow of Scripts

![ad scraping workflow](https://user-images.githubusercontent.com/73327197/212185370-952e9f18-6010-462f-9819-8fecfb01baac.png)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
