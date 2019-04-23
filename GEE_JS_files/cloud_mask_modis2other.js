/*
Note: I assume all times are in utc

The sun-synchronous orbit allows MODIS to pass over
the same area at the same time in every 24 hour period.
The exact time isn't in the meta data, but according to
NASA charts I looked at it is either around 3:00 or 16:35utc,
which is 11:00pm est and 12:35pm est

Looking at the list of LS images, it appears that the images
are taken roughly 15:25utc or 11:25am est.

The change in cloud cover seems too dramatic. I am confused.
*/


/*
  Set up the initial conditions for the test run. This
  includes the start and end dates, the data pull etc.

  Helpful info for the tests.
  Planet center coordinates: -70.892, 41.6555
  Planet time range: 2014-07-03 to 2016-12-24

  In an attempt to understand how well the cloud masking
  was working, I paired the MODIS data with LandSat data.
  I chose to do this because the Landsat has its own set of
  QC bits for cloud masking and I wanted a situation where we
  could automate performance. After digging into the results
  it seems that using MODIS in a simple fasion is actually not
  great.

  Clouds can move fast yo. Even over mid-eastcoast US.

*/
var start_date = '2016-01-01';
var end_date = '2016-1-20';
var planet_dataset = ee.ImageCollection('SKYSAT/GEN-A/PUBLIC/ORTHO/MULTISPECTRAL');

var planet_center = ee.Geometry.Point(-70.892, 41.6555);

var LSdataset = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                  .filterDate(start_date, end_date)
                  .filterBounds(planet_center);

var Mdataset = ee.ImageCollection('MODIS/006/MOD09GA')
                  .filterDate(start_date, end_date)
                  .filterBounds(planet_center);


/*
  Below are some of the masking functions. Uses some bit math to
  isolate relevant portions of the QC bits. Then it uses that to
  create a mask that can then be applied to the collection.
  These functions are to mask MODIS images.
*/

// A function to mask out pixels that did not have observations.
var maskEmptyPixels = function(image) {
  // Find pixels that had observations.
  var withObs = image.select('num_observations_1km').gt(0);
  return image.updateMask(withObs);
}

// A function to mask out cloudy pixels.
var maskClouds = function(image) {
  // Select the QA band.
  var QA = image.select('state_1km');
  // Make a mask to get bit 10, the internal_cloud_algorithm_flag bit.
  var bitMask = 1 << 10;
  // Return an image masking out cloudy areas.
  return image.updateMask(QA.bitwiseAnd(bitMask).eq(0));
};


/*
  To test how well the MODIS images work to perform masks for
  other image's datasets we also need to make a mask that generates
  a cloud mask directly off of the Landsat data.
*/

// Function to cloud mask from the pixel_qa band of Landsat 8 SR data.
function maskL8sr(image) {
  // Bits 3 and 5 are cloud shadow and cloud, respectively.
  var cloudShadowBitMask = 1 << 3;
  var cloudsBitMask = 1 << 5;

  // Get the pixel QA band.
  var qa = image.select('pixel_qa');

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
      .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask)
      .copyProperties(image, ["system:time_start"]);
}

/*
  Gets the dates of a input image collection. Not used in any
  functions currently, but it is useful for debugging.

  warning, annoyingly just trying to update the date to 0 out
  the smaller units leaves vestigial milliseconds
*/

var get_dates = function(imgcoll){
    imgcoll = ee.ImageCollection(imgcoll);
    var dates = imgcoll.toList(imgcoll.size()).map(function(img){
      var idate = ee.Image(img).date();
      return ee.Date.fromYMD(idate.get('year'), idate.get('month'), idate.get('day'))}
    );
    return dates};


/*
  Revised function to pair two datasets (assumed to be MODIS and the dataset of
  interest) and add the MODIS qc bands to the other dataset for cloud masking.

  Arguments:
  modis_dataset and other_dataset are the two image collections of
  interest.
  time_window is the max difference in time stamps allowed to pair the
  images. Since Modis data does not really include the time of day that an image
  was taken (instead it lists the time each image was taken as midnight) this
  won't do much more than pair images from the other collection with the MODIS
  image taken that day (or the day after if the Other dataset collects images
  in the afternoon).

  TODO: this should not be in this function if possible
  vis_first should be a bool that determines whether the first landsat image and
  modis image is displayed on the map for debugging purposes.

  Returns: The 'other' image collection with the MODIS qc bands appended to the
  corresponding image. It will remove any images from the other dataset that
  do not have a good match within the modis dataset.

  Useful info for time window param:
  3600000ms to 1 hour
  18000000ms to 5 hours
  32400000ms to 9 hours
  43200000ms to 12 hours
  86400000ms to 24 hours
*/

var pair_modis_QCbands = function (modis_dataset, other_dataset, time_window, vis_first){

    // Creates a filter that will be used to select images from each
    // image collection within a certian window of time from each other
    var timeFilter = ee.Filter.maxDifference({
      difference: time_window,
      leftField: 'system:time_start',
      rightField: 'system:time_start'
    });

    // joins on the time window criteria
    var paired_cols = ee.Join.inner('mod','oth','time_diff')
          .apply(modis_dataset, other_dataset, timeFilter);

    // Takes paired images and appends the modis QC bands to the
    // other image collection's images
    var other_with_mQC = paired_cols.map(function(pair){
      return ee.Image(ee.Feature(pair).get('oth')).addBands(
        ee.Image(ee.Feature(pair)).get('mod'), ['state_1km', 'num_observations_1km']);
    });

    if (vis_first){
      var other_img = ee.Image(ee.Feature(paired_cols.first()).get('oth'));
      var modis_img = ee.Image(ee.Feature(paired_cols.first()).get('mod'));
      var planet_comp = planet_dataset.select(['N', 'G', 'B']);

      var imgVis = {
        min: -100.0,
        max: 8000.0,
      };
      var planetVis = {
        min: 200.0,
        max: 6000.0,
      };

      Map.addLayer(other_img.select(['B5', 'B4', 'B3']), imgVis, 'Other first image');
      Map.addLayer(modis_img.select(['sur_refl_b05', 'sur_refl_b04', 'sur_refl_b03']),
          imgVis, 'modis first image');
      Map.addLayer(planet_comp, planetVis, 'Planet data');
    }

    return other_with_mQC;
}


var newcoll = ee.ImageCollection(pair_modis_QCbands(Mdataset, LSdataset, 32400000, true));


Map.setCenter(-70.892, 41.6555, 10);

/*
  The set of functions below handle visualizing the masks.
  It also generates error histograms (should be used only
  when comparing landsat and modis data). There are also
  functions that are used to generate histograms to understand
  the difference in landsat and modis masking, as well as
  reducers to get basic stats on the masking data.
*/

// mask out areas that were not observed.
var collection = newcoll.map(maskEmptyPixels);

// Get the total number of potential observations for the time interval.
var totalObsCount = collection
        .select('num_observations_1km')
        .count()


var mask_vis = false;
// mask out cloudy images from both the MODIS and other dataset
var collectionCloudMasked = collection.map(maskClouds);
var LScollectionCloudMasked = collection.map(maskL8sr);
// Get the total number of observations for non-cloudy pixels for the time
// interval.  The result is unmasked to set to unity so that all locations
// have counts, and the ratios later computed have values everywhere.
var clearObsCount = collectionCloudMasked
        .select('num_observations_1km')
        .count()
        .unmask(0)

var LSclearObsCount = LScollectionCloudMasked
        .select('num_observations_1km')
        .count()
        .unmask(0)

Map.addLayer(
    collectionCloudMasked.median(),
    {bands: ['B5', 'B4', 'B3'],
     gain: 0.07,
     gamma: 1.4
    },
    'median of modis-masked collection',
    mask_vis
  )
  Map.addLayer(
    collection.median(),
    {bands: ['B5', 'B4', 'B3'],
     gain: 0.07,
     gamma: 1.4
    },
    'median of no mask collection',
    mask_vis
  )


  Map.addLayer(
    LScollectionCloudMasked.median(),
    {bands: ['B5', 'B4', 'B3'],
     gain: 0.07,
     gamma: 1.4
    },
    'median of landsat-masked collection',
    mask_vis
  )


Map.addLayer(
    totalObsCount,
    {min: 84, max: 92},
    'count of total observations',
    false
  )
Map.addLayer(
    clearObsCount,
    {min: 0, max: 90},
    'Modis count of clear observations',
    false
  );

  Map.addLayer(
    LSclearObsCount,
    {min: 0, max: 90},
    'other count of clear observations',
    false
  );

  var diff = LSclearObsCount.subtract(clearObsCount);
  var percent_diff = diff.toFloat().divide(totalObsCount);

  Map.addLayer(
    diff,
    {min: 0,
      max: 8
    },
    'LS count - M count of clear observations',
    false
  );

Map.addLayer(
    clearObsCount.toFloat().divide(totalObsCount),
    {min: 0, max: 1},
    'ratio of clear to total observations',
    mask_vis
  );






var make_histograms = function(region){
    Map.addLayer(region);
    // Make the histogram, set the options.
      // Pre-define some customization options.
    var options = {
      title: 'Difference Value Distribution',
      fontSize: 20,
      hAxis: {title: 'Difference'},
      vAxis: {title: 'Num Pixels'},
      series: {
        0: {color: 'blue'}

      }
    };
    var dif_hist = ui.Chart.image.histogram(diff, region, 30)
        .setSeriesNames(['LS_clear - MODIS_clear'])
        .setOptions(options);

    // Display the histogram.
    print(dif_hist);
      // Pre-define some customization options.

    options = {
      title: 'Percent Difference Distribution',
      fontSize: 20,
      hAxis: {title: 'Percent Difference'},
      vAxis: {title: 'Num Pixels'},
      series: {
        0: {color: 'red'}

      }
    };
    var pdif_hist = ui.Chart.image.histogram(percent_diff, region, 30)
        .setSeriesNames(['(LS_clear - MODIS_clear)/Total Obs'])
        .setOptions(options);

      // Display the histogram.
    print(pdif_hist);
    return;
}


var get_img_stats = function(image, region){
    var quartile_obs = image.reduceRegion({
      reducer: ee.Reducer.percentile([0, 25, 50, 75, 100]),
      geometry: region,
      scale: 30,
      maxPixels: 1e9
    });

    var meanobs = image.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: region,
      scale: 30,
      maxPixels: 1e9
    });



    // The result is a Dictionary.  Print it.
    return {'Quartiles': quartile_obs,'Mean': meanobs};
};

var obs_reduce = collection
        .select('num_observations_1km')
        .reduce(ee.Reducer.minMax())

var sum_reduce = collection
        .select('num_observations_1km')
        .reduce(ee.Reducer.sum())


var region = ee.Geometry.Rectangle(-74.5555, 42.7219, -73.8, 42);
//make_histograms(region);
print("Number of Observations\n", get_img_stats(totalObsCount, region));
print("From Reduce\n", get_img_stats(obs_reduce, region));
print("From Sum Reduce\n", get_img_stats(sum_reduce, region));


var region2 = ee.Geometry.Rectangle(-71.5555, 41.2219, -70.8, 40.5)
print("Number of Observations\n", get_img_stats(totalObsCount, region2));
print("From Reduce\n", get_img_stats(obs_reduce, region2));
print("From Sum Reduce\n", get_img_stats(sum_reduce, region2));

