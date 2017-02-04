var fs = require('fs');
var categories = ["aeroplane","bicycle\t","bird\t","boat\t","bottle\t","bus\t","car\t","cat\t","chair\t","cow\t","diningtable","dog\t","horse\t","motorbike","person\t","pottedplant","sheep\t","sofa\t","train\t","tvmonitor"];

module.exports = {
  categories: categories,

  writeToFile: function (net) {
    console.log("Writing to file\t\t\t\r");
    var json = net.toJSON();
    fs.writeFileSync(__dirname + "/object-detection.json", JSON.stringify(json));
  },

  setVol: function (vol, _x) {
    var image_dimension = 224;
    var image_channels = 3;

    var W = image_dimension * image_dimension;
    var j = 0;
    for(var dc = 0; dc < image_channels; dc++) {
      var i = 0;
      for(var xc = 0; xc < image_dimension; xc++) {
        for(var yc = 0; yc < image_dimension; yc++) {
          var ix = i * 4 + dc;
          vol.set(yc,xc,dc,_x[ix]/255.0-0.5);
          i++;
        }
      }
    }
  },

  yToString: function (y) {
    return categories[y];
  },

  yHatToString: function (yHat) {
    var desc = [];
    for (var i = 0; i < yHat.length; i++) {
      desc.push({
        category: categories[i],
        prediction: Number(yHat[i]).toFixed(2),
      });
    }

    // descending
    desc.sort(function (a, b) {
      return b.prediction - a.prediction;
    });

    var result = "";
    for (var i = 0; i < 3; i++) {
      result += desc[i].category + ": " + desc[i].prediction + ", ";
    }

    return result;
  }
}
