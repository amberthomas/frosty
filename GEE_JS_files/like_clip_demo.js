var img_cover = /* color: #ff0000 */ee.Geometry.MultiPolygon(
        [[[[-156.96671504565677, 60.115970840027714],
           [-156.87056456031564, 59.94764599556892],
           [-156.43047882396615, 59.9399984489972],
           [-156.44770640910713, 59.72467066335482],
           [-156.32503435579213, 59.72233016813168],
           [-156.30443499055775, 59.737905565337805],
           [-156.54357689485516, 60.16651444911341],
           [-156.8620429679071, 60.17201765559342],
           [-156.84865338050474, 60.15237347066313],
           [-156.77312237464537, 60.13203364524661],
           [-156.79818493568052, 60.113563081569346]]],
         [[[-156.02411582923617, 60.15491963639078],
           [-156.6562475808782, 59.08161915749359],
           [-156.3542994865595, 59.077450317201716],
           [-156.3558059806801, 59.05949675158897],
           [-156.18752876913675, 59.064907442350304],
           [-155.9565999774136, 59.456109421090865],
           [-155.99245127852987, 59.8532622601356],
           [-155.9675678254145, 60.15341524675867]]]]);

// img_cover is just a quick way to filter demo lakes to the demo image set.
// filtering by image geometry did not work properly (too liberal with bounds).

var dataset = ee.ImageCollection('users/amberthomas/test_upload').median();
print(dataset)
//b1-blue; b2-green; b3-red; b4-NIR
var falseColor = dataset.select(['b4', 'b2', 'b1']);
var Vis = {
  min: 200.0,
  max: 6000.0,
};

var lake_test_vec = ee.FeatureCollection('users/amberthomas/region_subset_test')
   .filter(ee.Filter.bounds(img_cover));
var disp_lake_test = ee.Image(0).updateMask(0).paint(lake_test_vec, '000000', 1);

//.filter(ee.Filter.bounds(...)).
Map.setCenter(-156.4114, 59.6751, 12);
Map.addLayer(falseColor, Vis, 'False Color');
//Map.addLayer(dataset.select(['b3', 'b2', 'b1']), Vis, 'True Color');
Map.addLayer(disp_lake_test, {palette: 'limegreen'}, 'lake test region');


var buffer_clip_lake = function(img, lakes){
    var buffered_lakes = lakes.map(function(lake){return lake.buffer(50)});
    var buffered_lakes_disp = ee.Image(0).updateMask(0).paint(buffered_lakes, '000000', 1);
    Map.addLayer(buffered_lakes_disp, {palette: 'red'}, 'lake buffers');
    print(buffered_lakes.size());
    print(buffered_lakes.first());
    var bl_list = buffered_lakes.toList(buffered_lakes.size());
    print(bl_list.get(0));
    /*
	   This is just a proof of concept for exporting buffered clips from GEE.
	   I do not reccomend actually doing it from the js api like this. If you 
	   do it is slow, and each task must be individually approved in the 
	   'Tasks' side bar. The python api would be better suited, but still slow.
	   Note that 'Shape_Area' was used as a proxy for FID, since I did not copy
	   it over in the demo vector file. Predefine the folder in your Drive.  
	   
	   At this point, it might actually be faster to perform the clips in ArcMap. 
	*/
    for(var i=0; i<10; i++) {
      var clip_ext = ee.Feature(bl_list.get(i));
      print(clip_ext.get('Shape_Area').getInfo())
      Export.image.toDrive({
        image: img.clip(clip_ext.geometry()),
        description: 'part_' + clip_ext.get('Shape_Area').getInfo(),
        folder: 'Test_pull_data',
        scale: 4,
        region: clip_ext.geometry()
      });
    }
    
    
}

buffer_clip_lake(dataset, lake_test_vec);
