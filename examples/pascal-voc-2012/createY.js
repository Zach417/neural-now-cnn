var fs = require('fs');
var path = require('path');
var walk = require('walk');
var readline = require('readline');

var y = [];
var trainY = [];
var testY = [];
var categories = ["aeroplane","bicycle","bird","boat","bottle","bus","car","cat","chair","cow","diningtable","dog","horse","motorbike","person","pottedplant","sheep","sofa","train","tvmonitor"];

function completed () {
  for (var i = 0; i < y.length; i++) {
    if (Math.random() < 0.15) {
      testY.push(y[i]);
    } else {
      trainY.push(y[i]);
    }
  }

  fs.writeFileSync(__dirname + "/trainY.json", JSON.stringify(trainY));
  fs.writeFileSync(__dirname + "/testY.json", JSON.stringify(testY));

  console.log("completed");
}

function printProgress (i) {
  var line = Number((i + 1) / categories.length * 100).toFixed(2) + "% Written\t\t\r";
  process.stdout.write(line);
}

function walkFiles (i) {
  if (i >= categories.length - 1) {
    return completed();
  }

  printProgress(i);

  var category = categories[i];
  var originalPath = path.join(__dirname, "/JSONImages/", category);
  var walker = walk.walk(originalPath, { followLinks: false });

  walker.on('file', function(root, stat, next) {
    y.push({
      category: category,
      path: root + '/' + stat.name,
    });
    next();
  });

  walker.on('end', function() {
    walkFiles(i + 1);
  });
}

walkFiles(0);
