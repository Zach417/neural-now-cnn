var input = require('./input');
var conv = require('./conv');
var dropout = require('./dropout');
var fc = require('./fc');
var normalization = require('./normalization');
var max = require('./max');
var pool = require('./pool');
var regression = require('./regression');
var relu = require('./relu');
var sigmoid = require('./sigmoid');
var softmax = require('./softmax');
var svm = require('./svm');
var tanh = require('./tanh');
var input = require('./input');

module.exports = {
  input: input,
  conv: conv,
  dropout: dropout,
  fc: fc,
  normalization: normalization,
  max: max,
  pool: pool,
  regression: regression,
  relu: relu,
  sigmoid: sigmoid,
  softmax: softmax,
  svm: svm,
  tanh: tanh,
}
