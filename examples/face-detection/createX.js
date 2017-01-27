var fs = require('fs');
var path = require('path');
var walk = require('walk');
var getPixels = require("get-pixels");

var files = [];
var originalPath = path.join(__dirname, "/resizedPics");
var walker  = walk.walk(originalPath, { followLinks: false });
fs.writeFileSync(__dirname + "/x.json", "[");

function processImage (i) {
  if (i >= files.length - 1) {
    return;
  }

  getPixels(files[i], function(err, pixels) {
    var grayScale = [];
    for (var j = 0; j < pixels.data.length; j++) {
      var r = pixels.data[j];
      var g = pixels.data[j + 1];
      var b = pixels.data[j + 2];
      var a = pixels.data[j + 3];
      var avg = (r + g + b) / 3;
      var norm = (avg / 255) - 0.5;
      grayScale.push(Number(Number(norm).toFixed(4)));

      j += 3;
    }

    var json = { path: files[i], pixels: grayScale };
    var path = json.path.replace("jpg","json").replace("resizedPics","jsonPics");
    fs.writeFileSync(path, JSON.stringify(json));

    var line = Number((i + 1) / files.length * 100.0).toFixed(2) + "% Complete\t\t\r";
    process.stdout.write(line);

    pixels = null;
    grayScale = null;

    processImage(i + 1);
  });
}

console.log("Counting and gathering all images.");
walker.on('file', function(root, stat, next) {
  files.push(root + '/' + stat.name);
  next();
});

walker.on('end', function() {
  console.log(files.length + " images found. Starting process.");
  processImage(0);
});
