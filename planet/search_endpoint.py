import os
import requests
from requests.auth import HTTPBasicAuth

# our demo filter that filters by geometry, date and cloud cover
from demo_filters import anchorage_test

# Search API request object
search_endpoint_request = {
  "item_types": ["REOrthoTile", "REScene","SkySatScene", "SkySatCollect"],
  "filter": anchorage_test
}

result = \
  requests.post(
    'https://api.planet.com/data/v1/quick-search',
    auth=HTTPBasicAuth(os.environ['PL_API_KEY'], ''),
    json=search_endpoint_request)

print (result.text)
