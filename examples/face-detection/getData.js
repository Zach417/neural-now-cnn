var fs = require('fs');

module.exports = function () {
  var trainX = [];
  var trainY = JSON.parse(fs.readFileSync(__dirname + "/trainY.json"));
  var testX = [];
  var testY = JSON.parse(fs.readFileSync(__dirname + "/testY.json"));

  for (var i = 0; i < trainY.length; i++) {
    var y = trainY[i];
    var xPath = y.path.replace("resizedPics", "jsonPics") + ".json";
    var imgJson = JSON.parse(fs.readFileSync(xPath));
    trainX.push(imgJson.pixels);
  }

  for (var i = 0; i < testY.length; i++) {
    var y = testY[i];
    var xPath = y.path.replace("resizedPics", "jsonPics") + ".json";
    var imgJson = JSON.parse(fs.readFileSync(xPath));
    testX.push(imgJson.pixels);
  }

  return {
    trainX: trainX,
    trainY: trainY,
    testX: testX,
    testY: testY,
  }
}
