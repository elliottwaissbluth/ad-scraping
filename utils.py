import re

def get_double_underscore_string(input_str):
    '''Written by ChatGPT
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