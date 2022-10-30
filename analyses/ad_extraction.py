from bs4 import BeautifulSoup
import re

def get_text_from_json(j, text=None):
    '''Recursively gets all the text in <p> tags from the json output by
    RecursiveDumpPageSourceCommand

    Args:
        j (json dict): JSON output by json.load(<json file>)
        text (dict, optional): Dictionary with key-value pairs:
            iframe id (str) : text in iframe (List[str])

    Returns:
        dict: text, see description above
    '''
    # Initialize for initial function call
    if text is None:
        text = {}

    # Base case: there are no more internal iframes to investigate
    if 'iframes' in j.keys():
        frames = j['iframes']
    else:
        return text
    
    # Parse all frames at particular level
    for f in frames.keys():
        # Get html of iframe
        html_block = frames[f]['source']
        html_block = bytes(html_block, "utf-8").decode('unicode_escape')

        # Get <p> tags from html
        soup = BeautifulSoup(html_block, 'html.parser')
        p_tags = soup.find_all('p')
        
        # Parse <p> tags to find text
        for tag in p_tags:
            if tag.text.strip():
                if f not in text.keys(): # Initialize for first entry
                    text[f] = []
                text[f].append(tag.text.strip())
        
        # Call recursively from inner frame
        text = get_text_from_json(frames[f], text)
    
    return text

def get_adurl_from_json(j, urls=None):
    '''Recursively gets links marked with "adurl=" from the json output by
    RecursiveDumpPageSourceCommand

    Args:
        j (json dict): JSON output by json.load(<json file>)
        urls (dict, optional): Dictionary with key-value pairs:
            iframe id (str) : adurl in iframe (List[str])

    Returns:
        dict: urls, see description above
    '''
    # Initialize for initial function call
    if urls is None:
        urls = {}

    # Base case: there are no more internal iframes to investigate
    if 'iframes' in j.keys():
        frames = j['iframes']
    else:
        return urls
    
    # Parse all frames at particular level
    for f in frames.keys():
        # Get html of iframe
        html_block = frames[f]['source']
        html_block = bytes(html_block, "utf-8").decode('unicode_escape')

        # Get adurls from html
        soup = BeautifulSoup(html_block, 'html.parser')
        links = soup.find_all('a', href=True)
        
        # Parse urls
        for link in links:
            ref = link['href']
            if 'adurl=' in ref:
                start = re.search('adurl=', ref).end()
                ref = ref[start:]
                if f not in urls.keys() and ref: # Initialize for first entry
                    urls[f] = []
                if ref:
                    urls[f].append(ref)
        
        # Call recursively from inner frame
        urls = get_adurl_from_json(frames[f], urls)
    
    return urls

def get_utag_data_from_json(j):
    html_block = str(j['source'])
    html_block = bytes(html_block, "utf-8").decode('unicode_escape')

    soup = BeautifulSoup(html_block, 'html.parser')

    scripts = soup.find_all('script', {"type" : "text/javascript"})

    utag_data = {}
    for script in scripts:
        if 'window.utag_data.backend' in str(script):
            script = str(script)
            vals = re.finditer('(?<=utag_data\.)(.*)(?=;)', script)
            for utag in [v.group() for v in vals]:
                utag = utag.replace(' ', '')
                utag = utag.replace('"', '')
                utag = utag.split('=')
                utag_data[utag[0]] = utag[1]

    return utag_data

def get_destination_url_from_json(j):
    '''Gets the url listed after "destinationUrl: " tag in ad div

    Args:
        j (json dict): JSON output by json.load(<json file>)

    Returns:
        url (str): single url grabbed from destinationUrl
    '''

    # Base case: there are no more internal iframes to investigate
    if 'iframes' in j.keys():
        frames = j['iframes']
    else:
        return None
    
    # Parse all frames at particular level
    for f in frames.keys():
        # Get html of iframe
        html_block = frames[f]['source']
        html_block = bytes(html_block, "utf-8").decode('unicode_escape')

        # Get adurls from html
        soup = BeautifulSoup(html_block, 'html.parser')
        div = soup.find_all('div', {'id' : 'ad_unit'})
        if div:
            div = str(div[0])
            url = re.findall("(?<=destinationUrl: ')(.*?)(?=')", div)
            if url:
                return url[0]
            else:
                url = get_destination_url_from_json(frames[f])
        else:
            url = get_destination_url_from_json(frames[f])
     
    return None
