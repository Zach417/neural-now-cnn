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

function shuffleData() {
  var data = getData();
  var trainX = data.trainX;
  var trainY = data.trainY;
  var testX = data.testX;
  var testY = data.testY;
}

var layer_defs = [];
// layer_defs.push({type:'input', out_sx:225, out_sy:225, out_depth:3});
// layer_defs.push({type:'conv', sx:11, filters:64, stride:4, pad:2, activation:'relu'});
// layer_defs.push({type:'lrn', k:1, n:3, alpha:0.1, beta:0.75});
// layer_defs.push({type:'pool', sx:7, stride:2});
// layer_defs.push({type:'conv', sx:11, filters:128, stride:4, pad:2, activation:'relu'});
// layer_defs.push({type:'lrn', k:1, n:3, alpha:0.1, beta:0.75});
// layer_defs.push({type:'conv', sx:11, filters:256, stride:4, pad:2, activation:'relu'});
// layer_defs.push({type:'lrn', k:1, n:3, alpha:0.1, beta:0.75});
// layer_defs.push({type:'pool', sx:3, stride:1});
// layer_defs.push({type:'dropout'});
// layer_defs.push({type:'fc', num_neurons:1024, activation:'relu'});
// layer_defs.push({type:'dropout'});
// layer_defs.push({type:'fc', num_neurons:20, activation:'relu'});
// layer_defs.push({type:'softmax', num_classes:20});
layer_defs.push({type:'input', out_sx:225, out_sy:225, out_depth:3});
layer_defs.push({type:'conv', sx:11, filters:64, stride:4, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:7, stride:2});
layer_defs.push({type:'conv', sx:11, filters:128, stride:4, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:7, stride:2});
layer_defs.push({type:'conv', sx:11, filters:256, stride:4, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:7, stride:2});
layer_defs.push({type:'softmax', num_classes:20});

console.log("Generating neural network");
var json = JSON.parse(fs.readFileSync(__dirname + "/object-detection.json"));
var net = new cnn.net();
net.makeLayers(layer_defs);
net.fromJSON(json);

var trainer = new cnn.trainer(net, {
  method: 'adagrad',
  l2_decay: 0.001,
  l1_decay: 0.001,
  batch_size: 10
});

function setVol (vol, _x) {
  var image_dimension = 225;
  var image_channels = 3;

  var W = image_dimension * image_dimension;
  var j = 0;
  for(var dc = 0; dc < image_channels; dc++) {
    var i = 0;
    for(var xc = 0; xc < image_dimension; xc++) {
      for(var yc = 0; yc < image_dimension; yc++) {
        var ix = i * 4 + dc;
        vol.set(yc,xc,dc,_x[ix]);
        i++;
      }
    }
  }
}

console.log("Beginning training");
var epochs = 500;
for (var i = 0; i < epochs; i++) {
  var loss = 0;
  for (var j = 0; j < trainX.length; j++) {
    var x = new cnn.vol(225, 225, 3, 0);
    setVol(x, trainX[j]);
    var y = trainY[j];
    var stats = trainer.train(x, y);
    loss += stats.loss;
  }

  shuffleData();

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
    var x = new cnn.vol(225, 225, 3, 0);
    setVol(x, trainX[i]);
    var y = trainY[i];
    var yHat = net.forward(x).w;
    console.log("Actual: " + y + "; Prediction: " + yHat);
  }
}

console.log("\nTesting Set Predictions");
var n = 5 / testX.length;
for (var i = 0; i < testX.length; i++) {
  if (Math.random() < n) {
    var x = new cnn.vol(225, 225, 3, 0);
    setVol(x, testX[i]);
    var y = testY[i];
    var yHat = net.forward(x).w;
    console.log("Actual: " + y + "; Prediction: " + yHat);
  }
}
