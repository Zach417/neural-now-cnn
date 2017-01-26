var fs = require('fs');
var path = require('path');
var walk = require('walk');
var lwip = require('lwip');

var files = [];
var originalPath = path.join(__dirname, "/originalPics");
var walker  = walk.walk(originalPath, { followLinks: false });

console.log("Counting and gathering all images.");
walker.on('file', function(root, stat, next) {
  files.push(root + '/' + stat.name);
  next();
});

var filesWritten = -1;
function printProgress () {
  var line = "";
  line += Number((filesWritten) / files.length).toFixed(2) + "% Written\t\t\r";
  process.stdout.write(line);
}

function processImage (i) {
  filesWritten++;
  if (i >= files.length - 1) {
    console.log("Process complete");
    return;
  }

  var source = files[i];
  var destination = files[i].replace("originalPics", "resizedPics");

  printProgress();
  lwip.open(source, function(err, image){
    image.batch()
      .scale(0.5)
      .crop(0, 0, 100, 200)
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
