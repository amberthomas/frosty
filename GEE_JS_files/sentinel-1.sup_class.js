// This demonstration uses hand-located points to train a classifier.
// Each training point has a field called 'landcover' containing
// class labels at that location. The following block contains
// construction code for the points.  Hover on the 'urban' variable
// and click, 'Convert' in the dialog.
var water = /* color: #ff0000 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-149.8152, 61.4932]),
            {
              "landcover": 0,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([-150.2231, 61.4624]),
            {
              "landcover": 0,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([-149.8454, 61.5335]),
            {
              "landcover": 0,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([-149.9395, 61.527]),
            {
              "landcover": 0,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([-150.5185, 61.3997]),
            {
              "landcover": 0,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([-150.4279, 61.449]),
            {
              "landcover": 0,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([-150.2707, 61.4214]),
            {
              "landcover": 0,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([-149.6103, 61.4328]),
            {
              "landcover": 0,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([-150.2611, 61.2478]),
            {
              "landcover": 0,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([-150.5591, 61.2369]),
            {
              "landcover": 0,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([-150.5666, 61.295]),
            {
              "landcover": 0,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([-149.8539, 61.3145]),
            {
              "landcover": 0,
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([-149.8806, 61.2993]),
            {
              "landcover": 0,
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([150.4547, 61.3296]),
            {
              "landcover": 0,
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([-150.1732, 61.3237]),
            {
              "landcover": 0,
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([-150.4032, 61.3023]),
            {
              "landcover": 0,
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([-150.4155, 61.3165]),
            {
              "landcover": 0,
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([-150.4973, 61.3438]),
            {
              "landcover": 0,
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([-150.5151, 61.3392]),
            {
              "landcover": 0,
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([-151.421, 60.943]),
            {
              "landcover": 0,
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([-150.7975, 61.1358]),
            {
              "landcover": 0,
              "system:index": "20"
            }),
         ee.Feature(
            ee.Geometry.Point([-150.6327, 61.0508]),
            {
              "landcover": 0,
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([-150.0779, 61.2232]),
            {
              "landcover": 0,
              "system:index": "22"
            })]),
    not_water = /* color: #0300ff */ee.FeatureCollection(
       [ee.Feature(
            ee.Geometry.Point([-149.8152, 61.4932]),
            {
              "landcover": 0,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([-149.579, 61.8533]),
            {
              "landcover": 1,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([-149.5495, 61.8387]),
            {
              "landcover": 1,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([-149.4581, 61.8468]),
            {
              "landcover": 1,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([-149.3551, 61.8556]),
            {
              "landcover": 1,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([-149.763, 61.8313]),
            {
              "landcover": 1,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([-149.5158, 61.8404]),
            {
              "landcover": 1,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([-149.5192, 61.795]),
            {
              "landcover": 1,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([-149.362, 61.8002]),
            {
              "landcover": 1,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([-149.8372, 61.8076]),
            {
              "landcover": 1,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([-149.4087, 61.7872]),
            {
              "landcover": 1,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([-148.9026, 61.8452]),
            {
              "landcover": 1,
              "system:index": "11"
            })]);


var newfc = water.merge(not_water);


var sentinel1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(ee.Geometry.Rectangle(-149.78759765625, 61.21870180571184, -148.42803955078125, 61.7822147638152 ))
  .filterDate('2016-05-01', '2018-9-30')
  .filter(ee.Filter.dayOfYear(135, 257));

// Filter by metadata properties.
var vh = sentinel1
  // Filter to get images with VV and VH dual polarization.
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  // Filter to get images collected in interferometric wide swath mode.
  .filter(ee.Filter.eq('instrumentMode', 'IW'));



// Filter to get images from different look angles.
var vhAscending = vh.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'));
var vhDescending = vh.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'));

// Create a composite from means at different polarizations and look angles.
var composite = ee.Image.cat([
  vhAscending.select('VH').mean(),
  ee.ImageCollection(vhAscending.select('VV').merge(vhDescending.select('VV'))).mean(),
  vhDescending.select('VH').mean()
]).focal_median();

print(composite);

Map.setCenter(-150.63, 61.637, 7);
Map.addLayer(composite, {min: [-25, -20, -25], max: [0, 10, 0]}, 'composite');



// Use these bands for classification.
var bands = ['VV', 'VH', 'VH_1'];
// The name of the property on the points storing the class label.
var classProperty = 'landcover';

// Sample the composite to generate training data.  Note that the
// class label is stored in the 'landcover' property.
var training = composite.select(bands).sampleRegions({
  collection: newfc,
  properties: [classProperty],
  scale: 30
});

// Train a CART classifier.
var classifier = ee.Classifier.cart().train({
  features: training,
  classProperty: classProperty,
});
// Print some info about the classifier (specific to CART).
//print('CART, explained', classifier.explain());

// Classify the composite.
var classified = composite.classify(classifier);
Map.addLayer(classified, {min: 0, max: 1, palette: ['blue', 'red']});

// Optionally, do some accuracy assessment.  Fist, add a column of
// random uniforms to the training dataset.
var withRandom = training.randomColumn('random');

// We want to reserve some of the data for testing, to avoid overfitting the model.
var split = 0.7;  // Roughly 70% training, 30% testing.
var trainingPartition = withRandom.filter(ee.Filter.lt('random', split));
var testingPartition = withRandom.filter(ee.Filter.gte('random', split));

// Trained with 70% of our data.
var trainedClassifier = ee.Classifier.gmoMaxEnt().train({
  features: trainingPartition,
  classProperty: classProperty,
  inputProperties: bands
});

// Classify the test FeatureCollection.
var test = testingPartition.classify(trainedClassifier);

// Print the confusion matrix.
var confusionMatrix = test.errorMatrix(classProperty, 'classification');
print('Confusion Matrix', confusionMatrix);
