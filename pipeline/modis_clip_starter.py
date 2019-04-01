import ee
import time
import sys
import numpy as np
import pandas as pd
import itertools
import os
import urllib
from datetime import date

ee.Initialize()


"""
This handles exporting a single image from the Google Earth database to
your Google drive. 
"""
def export_oneimage(img,folder,name,scale,crs):
  task = ee.batch.Export.image.toDrive(img, name, folder, name, None, None, scale, crs)
  task.start()
  while task.status()['state'] == 'RUNNING':
    print ('Running...')
    # Perhaps task.cancel() at some point.
    time.sleep(10)
  print ('Done.', task.status())




"""
Locations should just be a list of points in the regions we are 
interested in viewing, they can be used as the center of a rectangle
or circle, or just used to filter by a pre-defined feture collection.

Form: (area_name_level1, area_name_level2, lat, lon) 

"""
locations = pd.read_csv('ROI.csv')

"""
Using super_image makes the entire collection 1 large stacked image.
Ex. Instead of an image collection with 3, 7-band images, we have a
single 21 band image. 
Pros: much faster download speeds of a large image batch, good if only 
looking at changes over time on a single region
Cons: lose most of the associated meta-data with the individual images,
(need to store dates etc.), 

NOTE: in my experience, the largest area of bottle neck is almost always 
GDAL. Using the function to open and read in the geo.tiff as a numpy array
can take ages. Be sure you are running the most recent release of GDAL.
We may honestly want to consider writing a custom. 
"""
def super_image(collection):
    first = ee.Image(collection.first()).select([])
    def appendBand(current, previous):
        # Rename the band
        previous=ee.Image(previous)
        # you can select bands by name or index
        current = current.select(['sur_refl_b01', 'sur_refl_b02','sur_refl_b03','sur_refl_b04','sur_refl_b05','sur_refl_b06','sur_refl_b07'])
        return ee.Image(previous).addBands(current)
    return ee.Image(collection.iterate(appendBand, first))

imgcoll = ee.ImageCollection('MODIS/006/MOD09GA')\
    .filterBounds(ee.Geometry.Rectangle(-175, 70, -141, 53))\
    .filterDate('2018-06-1','2018-06-7')


"""
Takes in an image collection and outputs the dates the
individual images were collected.
May be useful if we go the batch tif route.
"""
def get_years(imgcoll):

    def ymdList(image, newlist):
        date = ee.Number.parse(image.date().format("YYYYMMdd"))
        newlist = ee.List(newlist)
        return ee.List(newlist.add(date).sort())

    yearlist = imgcoll.iterate(ymdList, ee.List([])).getInfo()
    yearlist = [date(int(str(y)[:4]), int(str(y)[4:6]), int(str(y)[6:8])) for y in yearlist]
    return yearlist

print(get_years(imgcoll))


img=super_image(imgcoll)


for loc1, loc2, lon, lat in locations.values:
    fname = '{}_{}'.format((loc1), (loc2))

    offset = 0.6
    scale  = 500
    crs='EPSG:4326'

    #region = region.geometry().coordinates().getInfo()[0]

    region = ee.Geometry.Rectangle([lon + offset, lat + offset, lon - offset, lat - offset])
    print(img.clip(region).geometry().coordinates().getInfo()[0])
    while True:
        try:
            export_oneimage(img.clip(region), 'Test_pull_data', fname, scale, crs)
        except:
            print ('retry')
            time.sleep(10)
            continue
        break
