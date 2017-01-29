var fs = require('fs');
var path = require('path');
var walk = require('walk');
var lwip = require('lwip');

var maxHeight = 224;
var maxWidth = 224;

var files = [];
var originalPath = path.join(__dirname, "/JPEGImages");
var walker  = walk.walk(originalPath, { followLinks: false });

console.log("Counting and gathering all images.");
walker.on('file', function(root, stat, next) {
  files.push(root + '/' + stat.name);
  next();
});

var filesWritten = -1;
function printProgress () {
  var line = "";
  line += Number((filesWritten) / files.length * 100).toFixed(2) + "% Written\t\t\r";
  process.stdout.write(line);
}

function processImage (i) {
  filesWritten++;
  if (i >= files.length - 1) {
    console.log("Process complete");
    return;
  }

  var source = files[i];
  var destination = files[i].replace("JPEGImages", "RESIZEDImages");

  printProgress();
  lwip.open(source, function(err, image){
    var scale = 1.0;
    var width = image.width();
    var height = image.height();

    if (width > height) {
      scale = maxWidth / width;
    } else {
      scale = maxHeight / height;
    }

    image.batch()
      .resize(maxWidth, maxHeight)
      .crop(0, 0, maxWidth, maxHeight)
      .writeFile(destination, function(err){
        printProgress();
        processImage(i + 1);
      });
  });
}

walker.on('end', function() {
  console.log(files.length + " images found. Starting resize.");
  processImage(0);
});
