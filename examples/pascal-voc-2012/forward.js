var fs = require('fs');
var cnn = require('../../src');
var getPixels = require("get-pixels");
var lwip = require('lwip');

var categories = ["aeroplane","bicycle\t","bird\t","boat\t","bottle\t","bus\t","car\t","cat\t","chair\t","cow\t","diningtable","dog\t","horse\t","motorbike","person\t","pottedplant","sheep\t","sofa\t","train\t","tvmonitor"];

var json = JSON.parse(fs.readFileSync(__dirname + "/object-detection.json"));
var net = new cnn.net();
net.fromJSON(json);

function resizeImage (callback) {
  var maxWidth = 224;
  var maxHeight = 224;
  var source = "test.jpg";
  var destination = "testResized.jpg";

  lwip.open(source, function(err, image){
    var width = image.width();
    var height = image.height();
    image.batch()
      .resize(maxWidth, maxHeight)
      .crop(0, 0, maxWidth, maxHeight)
      .writeFile(destination, function(err){
        if (err) { return console.log(err); }
        callback();
      });
  });
}


function setVol (vol, _x) {
  var image_dimension = 224;
  var image_channels = 3;

  var W = image_dimension * image_dimension;
  var j = 0;
  for(var dc = 0; dc < image_channels; dc++) {
    var i = 0;
    for(var xc = 0; xc < image_dimension; xc++) {
      for(var yc = 0; yc < image_dimension; yc++) {
        var ix = i * 4 + dc;
        vol.set(yc,xc,dc,_x[ix]/255.0-0.5);
        i++;
      }
    }
  }
}

function yHatToString(yHat) {
  var desc = [];
  for (var i = 0; i < yHat.length; i++) {
    desc.push({
      category: categories[i],
      prediction: Number(yHat[i]).toFixed(2),
    });
  }

  // descending
  desc.sort(function (a, b) {
    return b.prediction - a.prediction;
  });

  var result = "";
  for (var i = 0; i < 5; i++) {
    result += desc[i].category + ": " + desc[i].prediction + ", ";
  }

  return result;
}

resizeImage(function () {
  getPixels("testResized.jpg", function(err, pixels) {
    var vector = [];
    for (var i = 0; i < pixels.data.length; i++) {
      var r = pixels.data[i];
      var g = pixels.data[i + 1];
      var b = pixels.data[i + 2];
      var a = pixels.data[i + 3];

      vector.push(r);
      vector.push(g);
      vector.push(b);
      vector.push(a);

      i += 3;
    }

    var x = new cnn.vol(224, 224, 3, 0);
    setVol(x, vector);
    var yHat = net.forward(x).w;
    console.log(yHatToString(yHat));
  });
});
