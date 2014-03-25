// test

'use strict';

var makeChan = require('../lib/chan-await');

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

function cb2(err, val) {
  if (err) {
    console.log('sent: '+ err);
  }
  else if (typeof val === 'object' && val !== null && ch.empty === val) {
    console.log('sent: empty');
  }
  else {
    console.log('sent: val = ' + val);
  }
} // cb2

var ch = makeChan();
console.log('ch 1');
ch(1); // send
console.log('ch 2');
ch(2); // send
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch 3');
ch(3); // send
console.log('ch.end');
ch.end(); // end
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
try {
  console.log('ch 4');
  ch(4); // send
} catch(err) {
  console.log(err + ': 4 cant send')
}
console.log();

var ch = makeChan();
console.log('ch 1');
ch(1)(cb2); // send
console.log('ch 2');
ch(2)(cb2); // send
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch 3');
ch(3)(cb2); // send
console.log('ch.end');
ch.end(); // end
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
try {
  console.log('ch 4');
  ch(4)(cb2); // send
} catch(err) {
  console.log(err + ': 4 cant send')
}
console.log();

var ch = makeChan(null, 1);
console.log('ch 1');
ch(1)(cb2); // send
console.log('ch 2');
ch(2)(cb2); // send
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch 3');
ch(3)(cb2); // send
console.log('ch.end');
ch.end(); // end
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log();

var ch = makeChan(null, 2);
console.log('ch 1');
ch(1)(cb2); // send
console.log('ch 2');
ch(2)(cb2); // send
console.log('ch 3');
ch(3)(cb2); // send
console.log('ch 4');
ch(4)(cb2); // send
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch 5');
ch(5)(cb2); // send
console.log('ch 6');
ch(6)(cb2); // send
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch.end');
ch.end(); // end
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log();


var ch = makeChan(null, Infinity);
console.log('ch 1');
ch(1)(cb2); // send
console.log('ch 2');
ch(2)(cb2); // send
console.log('ch 3');
ch(3)(cb2); // send
console.log('ch 4');
ch(4)(cb2); // send
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch 5');
ch(5)(cb2); // send
console.log('ch 6');
ch(6)(cb2); // send
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log('ch.end');
ch.end(); // end
console.log('ch');
ch(cb); // recv
console.log('ch');
ch(cb); // recv
console.log();

