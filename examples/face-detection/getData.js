var fs = require('fs');

module.exports = function () {
  var trainX = [];
  var trainY = JSON.parse(fs.readFileSync(__dirname + "/trainY.json"));
  var testX = [];
  var testY = JSON.parse(fs.readFileSync(__dirname + "/testY.json"));

  // 400 train
  for (var i = 0; i < 400; i++) {
    var y = trainY[i];
    var xPath = y.path.replace("resizedPics", "jsonPics") + ".json";
    var imgJson = JSON.parse(fs.readFileSync(xPath));
    trainX.push(imgJson);
  }

  // 100 test
  for (var i = 0; i < 100; i++) {
    var y = testY[i];
    var xPath = y.path.replace("resizedPics", "jsonPics") + ".json";
    var imgJson = JSON.parse(fs.readFileSync(xPath));
    testX.push(imgJson);
  }

  return {
    trainX: trainX,
    trainY: trainY,
    testX: testX,
    testY: testY,
  }
}
