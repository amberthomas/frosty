import os
import requests

item_id = ""
item_type = "PSOrthoTile"
asset_type = "analytIC"

# setup auth
session = requests.Session()
session.auth = (os.environ['PL_API_KEY'], '')

# request an item
item = \
  session.get(
    ("https://api.planet.com/data/v1/item-types/" +
    "{}/items/{}/assets/").format(item_type, item_id))

# extract the activation url from the item for the desired asset
item_activation_url = item.json()[asset_type]["_links"]["activate"]

# request activation
response = session.post(item_activation_url)

print (response.status_code)
