var fs = require('fs');
var cnn = require('../../src');
var getData = require('./getData');

console.log("Preparing training data set");
var data = getData();
var trainX = data.trainX;
var trainY = data.trainY;
var testX = data.testX;
var testY = data.testY;

var layer_defs = [];
layer_defs.push({type:'input', out_sx:100, out_sy:200, out_depth:1});
layer_defs.push({type:'conv', sx:10, filters:8, stride:5, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:5, stride:5});
layer_defs.push({type:'conv', sx:5, filters:10, stride:2, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:2, stride:2});
layer_defs.push({type:'fc', num_neurons:3, activation:'relu'});
layer_defs.push({type:'regression', num_neurons:18}); // detects up to 3 faces

console.log("Generating neural network");
var json = JSON.parse(fs.readFileSync(__dirname + "/face-detection.json"));
var net = new cnn.net();
net.makeLayers(layer_defs);
net.fromJSON(json);

var trainer = new cnn.trainer(net, {
  method: 'adadelta',
  batch_size: 20,
  l2_decay: 0.0001,
});

function getY (trainY) {
  var y0 = [];
  for (var i = 0; i < trainY.faces.length; i++) {
    var face = trainY.faces[i];
    y0.push(face.majorAxisRadius);
    y0.push(face.minorAxisRadius);
    y0.push(face.angle);
    y0.push(face.centerX);
    y0.push(face.centerY);
    y0.push(face.detectionScore);
  }

  // ensure an array of size 18
  var y = [];
  for (var i = 0; i < 18; i++) {
    if (y0[i]) {
      y[i] = y0[i];
    } else {
      y[i] = 0;
    }
  }
  return y;
}

console.log("Beginning training");
var epochs = 1000;
for (var i = 0; i < epochs; i++) {
  var loss = 0;
  for (var j = 0; j < trainX.length; j++) {
    var x = new cnn.vol(100, 200, 1, 0);
    x.w = trainX[j];
    var y = getY(trainY[j]);
    var stats = trainer.train(x, y);
    loss += stats.loss;
  }

  if ((i * 10) % epochs == 0) {
    console.log("Cost: " + Number(loss / trainX.length).toFixed(8) + " (" + Number(i/epochs*100).toFixed(2) + "%)               \r");
    var json = net.toJSON();
    fs.writeFileSync(__dirname + "/face-detection.json", JSON.stringify(json));
  } else {
    process.stdout.write("Cost: " + Number(loss / trainX.length).toFixed(8) + " (" + Number(i/epochs*100).toFixed(2) + "%)               \r");
  }
}

var json = net.toJSON();
fs.writeFileSync(__dirname + "/face-detection.json", JSON.stringify(json));

console.log("\nTraining Set Predictions");
var n = 10 / trainX.length;
for (var i = 0; i < trainX.length; i++) {
  if (Math.random() < n) {
    var x = new cnn.vol(100, 200, 1, 0);
    x.w = trainX[i];
    var y = getY(trainY[i]);
    var yHat = net.forward(x).w;
    console.log("Actual: " + (y[5] + y[11] + y[17]) + "; Prediction: " + (yHat[5] + yHat[11] + yHat[17]));
  }
}

console.log("\nTesting Set Predictions");
var n = 10 / testX.length;
for (var i = 0; i < testX.length; i++) {
  if (Math.random() < n) {
    var x = new cnn.vol(100, 200, 1, 0);
    x.w = testX[i];
    var y = getY(testY[i]);
    var yHat = net.forward(x).w;
    console.log("Actual: " + (y[5] + y[11] + y[17]) + "; Prediction: " + (yHat[5] + yHat[11] + yHat[17]));
    console.log(y);
    console.log(yHat);
  }
}
