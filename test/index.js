var cnn = require('../src');

console.log("Preparing training data set");
var trainX = [[0], [Math.PI], [Math.PI / 2]];
var trainY = [[1], [-1], [0]]
var testX = [[Math.PI / 4], [Math.PI / 3]];
var testY = [[0.70710678118], [0.5]]

var layer_defs = [];
layer_defs.push({type:'input', out_sx: 1, out_sy: 1, out_depth: 1});
layer_defs.push({type:'fc', num_neurons:3, activation:'tanh'});
layer_defs.push({type:'fc', num_neurons:3, activation:'tanh'});
layer_defs.push({type:'regression', num_neurons:1});

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
