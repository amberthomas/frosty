# the geo json geometry object we got from geojson.io

geo_json_geometry = {
  "type": "Polygon",
  "coordinates": [
      [
            [
              -149.139404296875,
              61.03302192941602
            ],
            [
              -148.831787109375,
              61.03302192941602
            ],
            [
              -148.831787109375,
              61.16443708638272
            ],
            [
              -149.139404296875,
              61.16443708638272
            ],
            [
              -149.139404296875,
              61.03302192941602
      ]
    ]
  ]
}

# filter for items the overlap with our chosen geometry
geometry_filter = {
  "type": "GeometryFilter",
  "field_name": "geometry",
  "config": geo_json_geometry
}

# filter images acquired in a certain date range
date_range_filter = {
  "type": "DateRangeFilter",
  "field_name": "acquired",
  "config": {
    "gte": "2014-01-01T00:00:00.000Z",
    "lte": "2018-12-31T00:00:00.000Z"
  }
}
"""
# filter any images which are more than 50% clouds
cloud_cover_filter = {
  "type": "RangeFilter",
  "field_name": "cloud_cover",
  "config": {
    "lte": 0.5
  }
}
"""
# create a filter that combines our geo and date filters
# could also use an "OrFilter"
anchorage_test = {
  "type": "AndFilter",
  "config": [geometry_filter, date_range_filter]
}
