var fs = require('fs');
var path = require('path');
var walk = require('walk');
var readline = require('readline');

var categories = ["aeroplane","bicycle","bird","boat","bottle","bus","car","cat","chair","cow","diningtable","dog","horse","motorbike","person","pottedplant","sheep","sofa","train","tvmonitor"];

function yCreator (type, callback) {
  this.i = 0;
  this.y = [];
  this.type = type;

  this.printProgress = function (i) {
    var line = Number((i + 1) / categories.length * 100).toFixed(2) + "% Written\t\t\r";
    process.stdout.write(line);
  }

  this.step = function (type) {
    if (this.i >= categories.length - 1) {
      return callback(this.y);
    }

    this.printProgress(this.i);
    this.getCategoryPaths(function (paths) {
      for (var i = 0; i < paths.length; i++) {
        this.y.push(paths[i]);
      }

      this.i++;
      this.step();
    }.bind(this));
  }

  this.getCategoryPaths = function (callback) {
    var category = categories[this.i];
    var fileName = category + "_" + this.type + ".txt";
    var pathName = path.join(__dirname, "/ImageSets/Main/", fileName);
    var readStream = fs.createReadStream(pathName);
    var lineReader = readline.createInterface({input: readStream});

    var json = [];
    lineReader.on('line', function (line) {
      var lineArray = line.replace("  ", " ").split(" ");
      if (lineArray[1] === "1") {
        json.push({
          name: lineArray[0],
          category: category,
          originalPath: path.join(__dirname, "/RESIZEDImages/", lineArray[0] + ".jpg"),
          jsonPath: path.join(__dirname, "/JSONImages/", category, lineArray[0] + ".json"),
        });
      }
    });

    lineReader.on('close', function () {
      callback(json);
    });
  }

  this.step();
}

new yCreator('train', function (y) {
  fs.writeFileSync(__dirname + "/trainY.json", JSON.stringify(y));
});

new yCreator('val', function (y) {
  fs.writeFileSync(__dirname + "/testY.json", JSON.stringify(y));
});
