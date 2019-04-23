# Planet Labs Dataset Notes - (04/22/19)
Planet runs three different sensor products: PlanetScope (RGB,NIR), RapidEye (RGB, red edge, NIR) and SkySat (RGB, NIR, pan). Planet refers to 'scenes' which is a continuous strip of single frame images.

####Planet Products Overview
The **Basic Scene product** is a scaled Top of Atmosphere Radiance (at sensor) and sensor-corrected product and does not do anything to correct for geographic distortion. **OrthoScenes** represent the single-frame image captures as acquired by a Planet Scope satellite with additional post processing applied. **Ortho Tiles** are multiple ortho-rectified scenes in a single strip that have been merged and then divided according to a defined grid.

####Current Product Access
My product key currently grants access to the following products:
"MYD09GQ"
"PSScene4Band"
"SkySatScene"
"PSScene3Band"
"Sentinel1"
"REScene"
"REOrthoTile"
"Sentinel2L1C"
"MOD09GA"
"MYD09GA"
"SkySatCollect"
"PSOrthoTile"
"Landsat8L1G"
"MOD09GQ"

Out of these it looks like we have solid RapidEye and PlanetScope coverage.

###PlanetScope

When searching for image coverage over a particular region and time period (filtering specifications must be made in `planet/demo_filters.py` if using the following script) `python planet/search_endpoint.py | jq '.features[].id` you will get back a list of image names. The files follow an naming convention that makes it easy to understand what you have.

```
<acquisition date>_<acquisition time>_<satellite_id>_<productLevel><bandProduct>.<extension>
```

####Basic Scene for PlanetScope
Scaled Top of Atmosphere Radiance (at sensor) and sensor corrected product. The Basic Scene product is designed for users with advanced image processing and geometric correction capabilities. This product has scene based framing and is not projected to a cartographic projection. Radiometric and sensor corrections applied to the data.

####Ortho Scene / Tile for PlanetScope
Ortho-rectified, scaled Top of Atmosphere Radiance (at sensor) or Surface Reflectance image product suitable for analytic and visual applications. This product has scene based framing and projected to a cartographic projection (Scene) or a UTM projection (Tile).

Ideally we would likely want to use the PlanetScope Analytic Ortho Scene or Tile product.

###RapidEye
The RapidEy naming convention for Basic Scenes:
```
<acquisition_date>T<acquisition_time>_<satellite_id>_<productLevel>_<productType>.<extension>
```
And the RapidEye naming convention for Ortho Tiles:
```
<tileid>_<acquisition_date>_<satellite_id>_<productLevel>_<productType>.<extension>
```

####Basic Scene for RapidEye
The RapidEye Basic Scene product is radiometrically- and sensor-corrected, providing imagery as seen from the spacecraft without correction for any geometric distortions inherent in the imaging process, and is not mapped to a cartographic projection. The imagery data is accompanied by all spacecraft telemetry necessary for the processing of the data into a geo-corrected form.

####Ortho Tile for RapidEye
apidEye Satellite imagery ortho-rectified as individual 25 km by 25 km tiles. It has been processed to remove distortions caused by terrain and can be used for many cartographic purposes. Once again we want to use the Analytic product. The Analytic products are scaled to reflect the TOA Radiance.
