var fs = require('fs');
var path = require('path');
var walk = require('walk');
var lwip = require('lwip');
var readline = require('readline');

var files = [];
var result = [];

var scale = 1.0; // 0.5 - changed, let's see if it can still do it.
var width = 100;
var height = 200;

var originalPath = path.join(__dirname, "/FDDB-folds");
var walker  = walk.walk(originalPath, { followLinks: false });

function splitSet () {
  var portionTest = 0.15;

  var trainY = [];
  var testY = [];

  for (var i = 0; i < result.length; i++) {
    if (Math.random() < portionTest) {
      testY.push(result[i]);
    } else {
      trainY.push(result[i]);
    }
  }

  fs.writeFileSync(__dirname + "/trainY.json", JSON.stringify(trainY));
  fs.writeFileSync(__dirname + "/testY.json", JSON.stringify(testY));
}

function processFiles (i) {
  if (i === files.length - 1) {
    //fs.writeFileSync(__dirname + "/y.json", JSON.stringify(result));
    splitSet();
    return;
  }


  var input = fs.createReadStream(files[i]);
  var lineReader = readline.createInterface({input: input});

  var json;
  lineReader.on('line', function (line) {
    if (line.includes("/")) {
      if (json) {
        result.push({
          path: json.path,
          faces: json.faces,
        });
      }

      json = {
        path: path.join(__dirname, "resizedPics", line),
        faceCount: -1,
        faces: [],
      };
    } else if (json.faceCount === -1) {
      json.faceCount = Number(line);
    } else if (json.faces.length < json.faceCount) {
      var stats = line.replace("  ", " ").split(" ");
      var angle = Number(stats[2]);
      if (angle < 0) { angle += (Math.PI * 2); } // make sure it's a positive number
      json.faces.push({
        majorAxisRadius: Number(stats[0]) * scale,
        minorAxisRadius: Number(stats[1]) * scale,
        angle: angle,
        centerX: Number(stats[3]) * scale,
        centerY: Number(stats[4]) * scale,
        detectionScore: Number(stats[5]),
      });
    }
  });

  lineReader.on('close', function () {
    var line = Number((i + 1) / files.length * 100.0).toFixed(2) + "% Complete\t\t\r";
    process.stdout.write(line);
    processFiles(i + 1);
  });
}

console.log("Counting and gathering all files.");
walker.on('file', function(root, stat, next) {
  if (stat.name.includes("ellipseList")) {
    files.push(root + '/' + stat.name);
  }
  next();
});

walker.on('end', function() {
  console.log(files.length + " files found. Starting json conversion.");
  processFiles(0);
});
