// test

'use strict';

var makeChan = require('../lib/chan-simple');

var ch = makeChan();

function cb(err, val) {
  if (err) {
    console.log('recv: '+ err);
  }
  else if (typeof val === 'object' && val !== null && ch.empty === val) {
    console.log('recv: empty');
  }
  else {
    console.log('recv: val = ' + val);
  }
} // cb

ch(12);
ch(34);

ch(cb);
ch(cb);
ch(cb);

ch(56);

ch.close();
ch(cb);
ch(cb);

// ch(78);
