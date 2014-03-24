// test

'use strict';

var thunkify = require('../lib/thunkify');

var addSync = thunkify(function (a1, a2, cb) {
  cb(null, a1 + a2);
  cb(null, a2 - a1);
});

var addAsync = thunkify(function (a1, a2, cb) {
  setTimeout(function () {
    cb(null, a1 + a2);
  }, 400);
  setTimeout(function () {
    cb(null, a2 - a1);
  }, 500);
});

var tm = function (){
  return new Date().toISOString() + ' ';
}

var thunk1 = addSync(12, 34);
thunk1(function (err, data) { console.log(tm() + 'addSync callback 1! ' + data); });
thunk1(function (err, data) { console.log(tm() + 'addSync callback 2! ' + data); });

var thunk2 = addAsync(12, 34);
setTimeout(thunk2(function (err, data) { console.log(tm() + 'addAsync callback 1! ' + data); }), 300);
setTimeout(thunk2(function (err, data) { console.log(tm() + 'addAsync callback 2! ' + data); }), 600);

var thunk3 = addAsync(12, 34);
setTimeout(thunk3(function (err, data) { console.log(tm() + 'addAsync callback 3! ' + data); }), 700);
setTimeout(thunk3(function (err, data) { console.log(tm() + 'addAsync callback 4! ' + data); }), 900);
