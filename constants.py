SQL_CREATE_ADS_TABLE = """
CREATE TABLE IF NOT EXISTS ads (
    id integer PRIMARY KEY,
    date text NOT NULL,
    name text NOT NULL,
    source_file text NOT NULL,
    screenshot_file text NOT NULL,
    backend_mobile_detect integer,
    backend_geo_country text,
    backend_geo_region text,
    backend_geo_city text,
    backend_geo_lat real,
    backend_geo_long real,
    backend_geo_tmz text,
    backend_geo_network text,
    gdpr_user integer,
    mfSponsor text,
    p_tags text,
    adurls text,
    destinationUrl text
);
"""

SQL_CREATE_HOMES_TABLE = """
CREATE TABLE IF NOT EXISTS homes (
    id integer PRIMARY KEY,
    scrape_id integer NOT NULL,
    name text NOT NULL,
    date text NOT NULL,
    url text NOT NULL,
    filename text NOT NULL,
    keywords text,
    description text,
    title text,
    og_title text,
    og_site_name text,
    og_description text,
    twitter_keywords text,
    twitter_description text,
    twitter_title text,
    twitter_site text,
    FOREIGN KEY(scrape_id) REFERENCES ads(id) 
)
"""