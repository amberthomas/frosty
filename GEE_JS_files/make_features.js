


//link with roi: https://code.earthengine.google.com/08fd1f1a52428a22138d4763cc5ee0f2

var not_water_hand_select =
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.MultiPolygon(
        [[[[-150.5286375827194, 62.01978884727675],
           [-150.5286375827194, 62.00899487127087],
           [-150.50717991060026, 62.00899487127087],
           [-150.50717991060026, 62.01978884727675]]],
         [[[-147.56460573362528, 62.160120900029824],
           [-147.56460573362528, 62.154929690547995],
           [-147.55357649015605, 62.154929690547995],
           [-147.55357649015605, 62.160120900029824]]],
         [[[-150.75618974485894, 62.49764682808083],
           [-150.75618974485894, 62.49461457136833],
           [-150.74938766279718, 62.49461457136833],
           [-150.74938766279718, 62.49764682808083]]],
         [[[-150.9752812877406, 61.61996449218905],
           [-150.9752812877406, 61.61004927172922],
           [-150.9569135204066, 61.61004927172922],
           [-150.9569135204066, 61.61996449218905]]],
         [[[-151.15147143128183, 61.69978863346327],
           [-151.15147143128183, 61.698038845208245],
           [-151.14185839417246, 61.698038845208245],
           [-151.14185839417246, 61.69978863346327]]],
         [[[-151.1882069659498, 61.69116080889442],
           [-151.1882069659498, 61.6870088261197],
           [-151.18039637329843, 61.6870088261197],
           [-151.18039637329843, 61.69116080889442]]],
         [[[-151.1717274737623, 61.69575990241825],
           [-151.1717274737623, 61.69197485767036],
           [-151.16271525147226, 61.69197485767036],
           [-151.16271525147226, 61.69575990241825]]],
         [[[-151.0802319598463, 61.69563781144708],
           [-151.0802319598463, 61.69164924073667],
           [-151.06890230896738, 61.69164924073667],
           [-151.06890230896738, 61.69563781144708]]],
         [[[-150.66799461652977, 62.261110909304385],
           [-150.66799461652977, 62.25687598762281],
           [-150.66293060590965, 62.25687598762281],
           [-150.66293060590965, 62.261110909304385]]],
         [[[-150.89153132417834, 62.3701335972062],
           [-150.89153132417834, 62.367426758072526],
           [-150.8803733346764, 62.367426758072526],
           [-150.8803733346764, 62.3701335972062]]],
         [[[-150.92715105989612, 62.36814329808756],
           [-150.92715105989612, 62.3635651088689],
           [-150.9192975519005, 62.3635651088689],
           [-150.9192975519005, 62.36814329808756]]],
         [[[-148.02348280108237, 62.01588270337625],
           [-148.02348280108237, 62.01461907857803],
           [-148.01937365687155, 62.01461907857803],
           [-148.01937365687155, 62.01588270337625]]],
         [[[-151.78608901794422, 62.04486597519527],
           [-151.78608901794422, 62.04237125873445],
           [-151.77905090148914, 62.04237125873445],
           [-151.77905090148914, 62.04486597519527]]]], null, false);

var roi = ee.Geometry.Rectangle(-153.383, 63.682, -141.694, 60.106);



/*****************get data from raster/glacier ds**********************/

var dataset = ee.FeatureCollection('GLIMS/2016')
  .filter(ee.Filter.eq('glac_stat', 'exists'))
  .filter(ee.Filter.eq('geog_area', 'Alaska'))
  .filter(ee.Filter.bounds(roi));


var dataset = ee.FeatureCollection('GLIMS/2016')
  .filter(ee.Filter.eq('glac_stat', 'exists'))
  .filter(ee.Filter.eq('geog_area', 'Alaska'))
  //there are two large chunks that can basically be chosen by changing gt and lt,
  //adjusting the date will also change cluster
  //currently this seems to be the only setting that won't overload the api
  .filter(ee.Filter.lt('anlys_time', '2010-01-01'))
  .filter(ee.Filter.bounds(roi));
print(dataset.first().get('anlys_time'))
print(dataset.geometry().area())
var visParams = {
  palette: ['gray', 'cyan', 'blue'],
  min: 0.0,
  max: 10.0,
  opacity: 0.8,
};
var image = dataset.reduceToImage(['area'], ee.Reducer.first());


var landcover = ee.Image('ESA/GLOBCOVER_L4_200901_200912_V2_3').select('landcover');
//TODO ask evan about this masking shenannigan
var water = landcover.eq(210);
var glacier = (image.gte(0));
print(image)
//Map.addLayer(glacier.clip(roi), {min:0, max:1, palette:['black', 'yellow'], opacity:0.5}, 'glacier out');
glacier = glacier.updateMask(water.not())


// Mask water with itself to mask all the zeros (non-water).
water = water.mask(water);
// Display the mosaic.


//Map.addLayer(image, visParams, 'GLIMS/2016');

// Convert the water mask raster to feature collection
var vectors = water.reduceToVectors({
  geometry: roi,
  crs: landcover.projection(),
  geometryType: 'polygon',
  eightConnected: true,
  labelProperty: 'water'
});
print(vectors.size())
vectors = vectors.filter(ee.Filter.bounds(dataset.geometry()).not())
print(vectors.size())


var display = ee.Image(0).updateMask(0).paint(vectors, '000000', 1);

/******************add lake test vector assets***********************/
var lake_test_vec = ee.FeatureCollection('users/amberthomas/region_subset_test');
var disp_lake_test = ee.Image(0).updateMask(0).paint(lake_test_vec, '000000', 1);



/*******************show rgb img to choose GCP***********************/
function maskS2clouds(image) { var qa = image.select('QA60');
    var cloudBitMask = Math.pow(2, 10); var cirrusBitMask = Math.pow(2, 11);
    var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and( qa.bitwiseAnd(cirrusBitMask).eq(0));
    return image.updateMask(mask).divide(10000);
}


//looking at only summer months
var s2sum = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2016-05-01', '2018-10-15')
    .filterBounds(roi)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
    .filter(ee.Filter.dayOfYear(153, 274))
    .map(maskS2clouds) .median() .select("B2","B3","B4","B5","B6","B7","B8","B11");

var s2win = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2016-11-01', '2019-3-30')
    .filterBounds(roi)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
    .filter(ee.Filter.dayOfYear(274, 364))
    .map(maskS2clouds) .median() .select("B2","B3","B4","B5","B6","B7","B8","B11");

var rgbVis = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2'],
};


/**********************visualize on map****************************/

Map.centerObject(roi, 6);
//Map.addLayer(s2sum.clip(roi), rgbVis, 'RGB summer view');
//Map.addLayer(s2win.clip(roi), rgbVis, 'RGB winter view');
Map.addLayer(display, {palette: 'blue'}, 'vectors');
Map.addLayer(water.clip(roi), {palette: 'red'}, 'modis water');
Map.addLayer(glacier.clip(roi), {palette:['black']}, 'glacier no water');
Map.addLayer(disp_lake_test, {palette: 'limegreen'}, 'lake test region');
//roi for lake vectors covers roughly (-159.569, 61.457, -153.822, 57.577)

/********************select points from final feature collections***********************/

var num_per_class = 70;

var water_data = ee.FeatureCollection.randomPoints(vectors, num_per_class, 40);

var not_water = ee.FeatureCollection.randomPoints(dataset, parseInt(num_per_class/2), 40)
    .merge(ee.FeatureCollection.randomPoints(not_water_hand_select, parseInt(num_per_class/2), 40));

water_data = water_data.map(function (feature){ return feature.set({'landcover':0})})
not_water = not_water.map(function (feature){ return feature.set({'landcover':1})})

print(water_data.size())
print(not_water.size())

/***********************************************/
