var fs = require('fs');
var getPixels = require("get-pixels");

var trainY = JSON.parse(fs.readFileSync(__dirname + "/trainY.json"));
var testY = JSON.parse(fs.readFileSync(__dirname + "/testY.json"));

function writeImageToJson (y, callback) {
  getPixels(y.originalPath, function(err, pixels) {
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

    fs.writeFileSync(y.jsonPath, JSON.stringify(vector));
    callback();
  }.bind(y));
}

function showProgress (y, i) {
  var line = Number((i + 1) / y.length * 100).toFixed(2) + "%\t\t\r";
  process.stdout.write(line);
}

function step (y, i) {
  showProgress(y, i);
  writeImageToJson(y[i], function () {
    if (i + 1 < y.length) {
      step(y, i + 1);
    }
  });
}

step(trainY, 0);
step(testY, 0);
