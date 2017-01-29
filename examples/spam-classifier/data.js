var fs = require('fs');
var path = require('path');
var readline = require('readline');
var NeuralNowUtils = require('neural-now-utils');

var ham = [];
var spam = [];

var lineReader = readline.createInterface({
  input: fs.createReadStream(path.join(__dirname, "SMSSpamCollection.txt"))
});

lineReader.on('line', function (line) {
  if (line.startsWith("ham")) {
    ham.push(line.split('\t')[1]);
  } else if (line.startsWith("spam")) {
    spam.push(line.split('\t')[1]);
  }
});

lineReader.on('close', function () {
  var x = [];
  var y = [];

  for (var i = 0; i < ham.length; i++) {
    x.push(ham[i]);
    //y.push([0]);
    y.push(0);
  }

  for (var i = 0; i < spam.length; i++) {
    x.push(spam[i]);
    //y.push([1]);
    y.push(1);
  }

  var testX = [];
  var testY = [];
  var trainX = [];
  var trainY = [];

  for (var i = 0; i < x.length; i++) {
    var vector = NeuralNowUtils.Text.toBigramVector(x[i]);
    if (Math.random() < .25) {
      testX.push(vector);
      testY.push(y[i]);
    } else {
      trainX.push(vector);
      trainY.push(y[i]);
    }
  }

  fs.writeFileSync(__dirname + "/trainX.json", JSON.stringify(trainX), "utf-8");
  fs.writeFileSync(__dirname + "/trainY.json", JSON.stringify(trainY), "utf-8");
  fs.writeFileSync(__dirname + "/testX.json", JSON.stringify(testX), "utf-8");
  fs.writeFileSync(__dirname + "/testY.json", JSON.stringify(testY), "utf-8");
});
