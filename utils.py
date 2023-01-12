import re

def get_double_underscore_string(input_str):
    '''Finds the part of any string surrounded by double underscores. For
    example, if input_str = "abc__def__", the function returns "def"
    
    Written by ChatGPT

    Args:
        input_str (str): String to search within double underscores
    '''
    # Use a regular expression to find the part of the string that is enclosed
    # in double underscores (__)
    match = re.search(r"__(.*?)__", input_str)
    
    if match:
        # If a match is found, return the part of the string that was
        # enclosed in double underscores
        return match.group(0)
    else:
        # If no match is found, return an empty string
        return ""