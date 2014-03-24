// test

'use strict';

var chan = require('../lib/chan');

var ch = chan();

function cb(err, val) {
  if (err) console.log(err);
  else console.log(val);
}

chan(12);
chan(34);

chan(cb);
chan(cb);
chan(cb);

chan(56);
