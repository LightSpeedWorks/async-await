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

aa.thunkify = require('aa-thunkify');
aa.chan     = require('co-chan');
aa.co       = require('co');

exports = module.exports = aa;

})();
