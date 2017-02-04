var fs = require('fs');
var cnn = require('../../src');

console.log("Preparing training data set");
var trainX = JSON.parse(fs.readFileSync(__dirname + "/trainX.json"));
var trainY = JSON.parse(fs.readFileSync(__dirname + "/trainY.json"));
var testX = JSON.parse(fs.readFileSync(__dirname + "/testX.json"));
var testY = JSON.parse(fs.readFileSync(__dirname + "/testY.json"));

var layer_defs = [];
layer_defs.push({type:'input', out_sx: 49, out_sy: 49, out_depth: 1});
layer_defs.push({type:'conv', sx:3, filters:4, stride:1, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:2, stride:2});
layer_defs.push({type:'conv', sx:3, filters:8, stride:1, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:2, stride:2});
layer_defs.push({type:'conv', sx:3, filters:8, stride:1, pad:2, activation:'relu'});
layer_defs.push({type:'pool', sx:2, stride:2});
layer_defs.push({type:'fc', num_neurons:20, activation:'sigmoid'});
layer_defs.push({type:'softmax', num_classes:2});

console.log("Generating neural network");
var json = JSON.parse(fs.readFileSync(__dirname + "/spam-classifier.json"));
var net = new cnn.net();
net.makeLayers(layer_defs);
net.fromJSON(json);

var trainer = new cnn.trainer(net, {
  method: 'adadelta',
  batch_size: 20,
  l2_decay: 0.001
});

function writeToFile () {
  var json = net.toJSON();
  var pathName = __dirname + "/spam-classifier.json";

  // function round(value, decimals) {
  //   return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  // }
  //
  // // set to fixed in order to save disk space
  // for (var i = 0; i < json.layers.length; i++) {
  //   var layer = json.layers[i];
  //   if (layer.filters) {
  //     for (var j = 0; j < layer.filters.length; j++) {
  //       var filter = layer.filters[j];
  //       for (var k = 0; k < filter.w.length; k++) {
  //         filter.w[k] = round(filter.w[k], 6);
  //       }
  //     }
  //   }
  //   if (layer.biases) {
  //     for (var j = 0; j < layer.biases.length; j++) {
  //       var bias = layer.biases[j];
  //       for (var k = 0; k < bias.w.length; k++) {
  //         bias.w[k] = round(bias.w[k], 6);
  //       }
  //     }
  //   }
  // }

  fs.writeFileSync(pathName, JSON.stringify(json));
}

console.log("Beginning training");
var epochs = 20;
for (var i = 0; i < epochs; i++) {
  var loss = 0;
  for (var j = 0; j < trainX.length; j++) {
    var x = new cnn.vol(trainX[j]);
    var stats = trainer.train(x, trainY[j]);
    loss += stats.loss;
  }

  if ((i * 10) % epochs == 0) {
    console.log("Cost: " + Number(loss / trainX.length).toFixed(8) + " (" + Number(i/epochs*100).toFixed(2) + "%)               \r");
    writeToFile();
  } else {
    process.stdout.write("Cost: " + Number(loss / trainX.length).toFixed(8) + " (" + Number(i/epochs*100).toFixed(2) + "%)               \r");
  }
}

writeToFile();

var n = 15 / trainX.length;
console.log("\nTraining Set Predictions");
for (var i = 0; i < trainX.length; i++) {
  if (Math.random() < n) {
    var x = new cnn.vol(trainX[i]);
    var yHat = net.forward(x).w;
    console.log("Actual: " + trainY[i] + "; Prediction: " + yHat);
  }
}

var n = 15 / testX.length;
console.log("\nTesting Set Predictions");
for (var i = 0; i < testX.length; i++) {
  if (Math.random() < n) {
    var x = new cnn.vol(testX[i]);
    var yHat = net.forward(x).w;
    console.log("Actual: " + testY[i] + "; Prediction: " + yHat);
  }
}
