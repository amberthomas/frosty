import os
import requests
from requests.auth import HTTPBasicAuth

# our demo filter that filters by geometry, date and cloud cover
from demo_filters import anchorage_test

# Search API request object
search_endpoint_request = {
  #"item_types": ["REOrthoTile", "REScene","SkySatScene", "SkySatCollect"],
  "item_types": [
   # "MYD09GQ",
    "PSScene4Band",
   # "SkySatScene",
   # "PSScene3Band",
   # "Sentinel1",
   # "REScene",
   # "REOrthoTile",
   # "Sentinel2L1C",
   # "MOD09GA",
   # "MYD09GA",
   # "SkySatCollect",
   # "PSOrthoTile",
   # "Landsat8L1G",
   # "MOD09GQ"
    ],
  "filter": anchorage_test
}

result = \
  requests.post(
    'https://api.planet.com/data/v1/quick-search',
    auth=HTTPBasicAuth(os.environ['PL_API_KEY'], ''),
    json=search_endpoint_request)

print (result.text)
