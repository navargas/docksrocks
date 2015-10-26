var seed = require('seed-random');
var child_process = require('child_process');
var colors = ["red", "pink", "purple", "deep-purple", "indigo",
              "blue", "light-blue", "cyan", "teal", "green",
              "light-green", "lime", "yellow", "amber", "orange",
              "deep-orange", "brown", "blue-grey"];

exports.getArray = function(callback) {
  child_process.execFile('/application/bin/list_images', function(err, out, stderr) {
    if (process.env.DEV) {
      err = null;
      out = '["testImage1", "docks.rocks/testImage2", "test3/is/a/test", "wo-w", "thoseallbrown", ""]';
    }
    if (err) {
      console.log(err, stderr);
      callback(err, out, stderr);
      return;
    }
    out = JSON.parse(out);
    var result = [];
    for (var i = 0; i < out.length; i++) {
      if (!out[i]) continue;
      var color = colors[Math.floor(seed(out[i])() * colors.length)];
      result.push({name:out[i], color:color, more:'/images/'+out[i]});
    };
    callback(null, result);
  });
};
