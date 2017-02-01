var fs = require('fs');

var categories = ["aeroplane","bicycle","bird","boat","bottle","bus","car","cat","chair","cow","diningtable","dog","horse","motorbike","person","pottedplant","sheep","sofa","train","tvmonitor"];

function getY (category) {
  for (var i = 0; i < categories.length; i++) {
    if (categories[i] == category) {
      return i;
    }
  }
}

function shuffle(a) {
  var j, x, i;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
}

module.exports = function () {
  var _trainY = JSON.parse(fs.readFileSync(__dirname + "/trainY.json"));
  var _testY = JSON.parse(fs.readFileSync(__dirname + "/testY.json"));

  shuffle(_trainY);
  shuffle(_testY);

  var trainX = [];
  var trainY = [];
  var testX = [];
  var testY = [];

  //for (var i = 0; i < _trainY.length; i++) {
  for (var i = 0; i < 10.0; i++) {
    var y = _trainY[i];
    var imgJson = JSON.parse(fs.readFileSync(y.jsonPath));
    trainY.push(getY(y.category));
    trainX.push(imgJson);
  }

  //for (var i = 0; i < _testY.length; i++) {
  for (var i = 0; i < 1.5; i++) {
    var y = _testY[i];
    var imgJson = JSON.parse(fs.readFileSync(y.jsonPath));
    testY.push(getY(y.category));
    testX.push(imgJson);
  }

  return {
    trainX: trainX,
    trainY: trainY,
    testX: testX,
    testY: testY,
  }
}
