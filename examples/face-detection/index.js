var cnn = require('../src');

console.log("Preparing training data set");
var trainX = [];
var trainY = [];
var testX = [];
var testY = [];

var layer_defs = [];
layer_defs.push({type:'input', out_sx: 48, out_sy: 48, out_depth: 2352});
layer_defs.push({type:'conv', sx:5, filters:8, stride:1, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:2, stride:2});
layer_defs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:3, stride:3});
layer_defs.push({type:'fc', num_neurons:3, activation:'relu'});
layer_defs.push({type:'fc', num_neurons:3, activation:'relu'});
layer_defs.push({type:'regression', num_neurons:6});

console.log("Generating neural network");
var net = new cnn.net();
net.makeLayers(layer_defs);

var trainer = new cnn.trainer(net, {
  method: 'adadelta',
  batch_size: 20,
  l2_decay: 0.001
});

console.log("Beginning training");
var epochs = 1000;
for (var i = 0; i < epochs; i++) {
  var loss = 0;
  for (var j = 0; j < trainX.length; j++) {
    var x = new cnn.vol(trainX[j]);
    var stats = trainer.train(x, trainY[j]);
    loss += stats.loss;
  }

  if ((i * 10) % epochs == 0) {
    console.log(loss / trainX.length);
  }
}

console.log("\nTraining Set Predictions");
for (var i = 0; i < trainX.length; i++) {
  var x = new cnn.vol(trainX[i]);
  var yHat = net.forward(x).w;
  console.log("Actual: " + trainY[i] + "; Prediction: " + yHat);
}

console.log("\nTesting Set Predictions");
for (var i = 0; i < testX.length; i++) {
  var x = new cnn.vol(testX[i]);
  var yHat = net.forward(x).w;
  console.log("Actual: " + testY[i] + "; Prediction: " + yHat);
}
