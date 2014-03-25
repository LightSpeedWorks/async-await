// aa.js - async-await.js

(function () {
'use strict';

var util = require('util');
var inspect = util.inspect;

function aa(a) {
  if (typeof a === 'function' &&
      a.constructor.name === 'GeneratorFunction') {
    return aa.co.call(this, a);
  }
  return aa.chan.apply(this, arguments);
}

aa.thunkify = require('./thunkify');
aa.chan     = require('./chan');
aa.co       = require('co');

exports = module.exports = aa;

})();
