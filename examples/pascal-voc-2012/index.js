var fs = require('fs');
var cnn = require('../../src');
var getData = require('./getData');

function writeToFile (net) {
  var json = net.toJSON();
  fs.writeFileSync(__dirname + "/object-detection.json", JSON.stringify(json));
}

console.log("Preparing training data set");
var data = getData();
var trainX = data.trainX;
var trainY = data.trainY;
var testX = data.testX;
var testY = data.testY;

var layer_defs = [];
layer_defs.push({type:'input', out_sx:225, out_sy:225, out_depth:1});
layer_defs.push({type:'conv', sx:10, filters:8, stride:5, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:5, stride:5});
layer_defs.push({type:'conv', sx:5, filters:20, stride:2, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:2, stride:2});
layer_defs.push({type:'conv', sx:5, filters:20, stride:2, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:2, stride:2});
layer_defs.push({type:'softmax', num_classes:20});

console.log("Generating neural network");
var json = JSON.parse(fs.readFileSync(__dirname + "/object-detection.json"));
var net = new cnn.net();
net.makeLayers(layer_defs);
net.fromJSON(json);

var trainer = new cnn.trainer(net, {
  method: 'adadelta',
  batch_size: 20,
  l2_decay: 0.0001,
});

console.log("Beginning training");
var epochs = 100;
for (var i = 0; i < epochs; i++) {
  var loss = 0;
  for (var j = 0; j < trainX.length; j++) {
    var x = new cnn.vol(225, 225, 1, 0);
    x.w = trainX[j];
    var y = trainY[j];
    var stats = trainer.train(x, y);
    loss += stats.loss;
  }

  if ((i * 10) % epochs == 0) {
    console.log("Cost: " + Number(loss / trainX.length).toFixed(8) + " (" + Number(i/epochs*100).toFixed(2) + "%)               \r");
    writeToFile(net);
  } else {
    process.stdout.write("Cost: " + Number(loss / trainX.length).toFixed(8) + " (" + Number(i/epochs*100).toFixed(2) + "%)               \r");
  }
}

writeToFile(net);

console.log("\nTraining Set Predictions");
var n = 5 / trainX.length;
for (var i = 0; i < trainX.length; i++) {
  if (Math.random() < n) {
    var x = new cnn.vol(225, 225, 1, 0);
    x.w = trainX[i];
    var y = trainY[i];
    var yHat = net.forward(x).w;
    console.log("Actual: " + y + "; Prediction: " + yHat);
  }
}

console.log("\nTesting Set Predictions");
var n = 5 / testX.length;
for (var i = 0; i < testX.length; i++) {
  if (Math.random() < n) {
    var x = new cnn.vol(225, 225, 1, 0);
    x.w = testX[i];
    var y = testY[i];
    var yHat = net.forward(x).w;
    console.log("Actual: " + y + "; Prediction: " + yHat);
  }
}
