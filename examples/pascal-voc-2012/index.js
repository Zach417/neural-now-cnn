var fs = require('fs');
var cnn = require('../../src');
var getData = require('./getData');
var utils = require('./utils');

var data, trainX, trainY, testX, testY;
function shuffleData () {
  process.stdout.write("Shuffling data\t\t\t\r");
  data = getData();
  trainX = data.trainX;
  trainY = data.trainY;
  testX = data.testX;
  testY = data.testY;
}

var layer_defs = [];
layer_defs.push({type:'input', out_sx:224, out_sy:224, out_depth:3});
layer_defs.push({type:'pool', sx:7, stride:2});
layer_defs.push({type:'conv', sx:7, filters:16, stride:2, pad:2, activation:'relu'});
layer_defs.push({type:'conv', sx:7, filters:32, stride:2, pad:2, activation:'relu'});
layer_defs.push({type:'conv', sx:7, filters:32, stride:2, pad:2, activation:'relu'});
layer_defs.push({type:'softmax', num_classes:20});

var json = JSON.parse(fs.readFileSync(__dirname + "/object-detection.json"));
var net = new cnn.net();
net.makeLayers(layer_defs);
net.fromJSON(json);

var trainer = new cnn.trainer(net, {
  method: 'adadelta',
  l2_decay: 0.5,
  batch_size: 100,
});

shuffleData();

var epochs = 100;
var batches = Math.floor(epochs * trainX.length / trainer.batch_size);

trainer.onBatchComplete = function (stats) {
  var loss = "Batch #" + stats.batchNumber + " Loss: " + Number(stats.loss).toFixed(8);
  var progress = Number(stats.batchNumber/batches*100).toFixed(2) + "%";
  console.log(loss + " (" + progress + ")\t\t\t\r");
};

console.log("Beginning training - " + batches + " Total Batches");
for (var i = 0; i < epochs; i++) {
  shuffleData();

  for (var j = 0; j < trainX.length; j++) {
    var x = new cnn.vol(224, 224, 3, 0);
    utils.setVol(x, trainX[j]);
    var y = trainY[j];
    var stats = trainer.train(x, y);
    process.stdout.write("Batch #" + stats.batchNumber + ": " + Number(stats.batchProgress * 100).toFixed(2) + "%\t\t\t\r");
  }

  if (((i + 1) * 10) % epochs == 0) {
    utils.writeToFile(net);
  }
}

utils.writeToFile(net);

console.log("\n\nTraining Set Predictions");
for (var i = 0; i < 10; i++) {
  var x = new cnn.vol(224, 224, 3, 0);
  utils.setVol(x, trainX[i]);
  var y = trainY[i];
  var yHat = net.forward(x).w;
  console.log(utils.yToString(y) + "\t ---> " + utils.yHatToString(yHat));
}

console.log("\nTesting Set Predictions");
for (var i = 0; i < 10; i++) {
  var x = new cnn.vol(224, 224, 3, 0);
  utils.setVol(x, testX[i]);
  var y = testY[i];
  var yHat = net.forward(x).w;
  console.log(utils.yToString(y) + "\t ---> " + utils.yHatToString(yHat));
}
