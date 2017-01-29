var fs = require('fs');
var path = require('path');
var walk = require('walk');
var getPixels = require("get-pixels");

var images = [];
var trainX = [];
var testX = [];
var trainY = JSON.parse(fs.readFileSync(__dirname + "/trainY.json"));
var testY = JSON.parse(fs.readFileSync(__dirname + "/testY.json"));

var idxComp = 0;
var idxTotal = 0;
for (var i = 0; i < trainY.length; i++) {
  idxTotal += trainY[i].files.length - 1;
}

function completed () {
  console.log(images.length);
}

function processImage (cIdx, fIdx, y) {
  if (y[cIdx].files.length === 0) {
    if (cIdx < y.length - 1) {
      processImage(cIdx + 1, 0, y);
    } else if (cIdx >= y.length - 1 && fIdx >= y[cIdx].files.length - 1) {
      console.log("returned", cIdx, fIdx);
      completed();
      return;
    }
  }

  idxComp++;
  var line = Number(idxComp / idxTotal * 100).toFixed(2) + "% Complete\t\t\r";
  process.stdout.write(line);

  var category = y[cIdx].name;
  var pathName = y[cIdx].files[fIdx] + ".jpg";

  getPixels(pathName, function(err, pixels) {
    var grayScale = [];
    for (var i = 0; i < pixels.data.length; i++) {
      var r = pixels.data[i];
      var g = pixels.data[i + 1];
      var b = pixels.data[i + 2];
      var a = pixels.data[i + 3];
      var avg = (r + g + b) / 3;
      var norm = (avg / 255) - 0.5;
      grayScale.push(Number(Number(norm).toFixed(4)));

      i += 3;
    }

    var json = JSON.stringify(grayScale);
    var jsonPath = __dirname + "/JSONImages/" + category + "/" + fIdx + ".json";
    fs.writeFileSync(jsonPath, json);

    pixels = null;
    grayScale = null;

    if (cIdx >= y.length - 1 && fIdx >= y[cIdx].files.length - 1) {
      console.log("returned", cIdx, fIdx);
      completed();
      return;
    } else if (fIdx >= y[cIdx].files.length - 1) {
      processImage(cIdx + 1, 0, y);
    } else {
      processImage(cIdx, fIdx + 1, y);
    }
  });
}

processImage(0, 0, trainY);
processImage(0, 0, testY);
