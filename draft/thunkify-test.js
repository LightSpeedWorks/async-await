'use strict';

var thunkify = require('./thunkify');

var fs = require('fs');
var aa = require('../aa');

var timer = thunkify(function (ms, cb) {
  return setTimeout(cb, ms);
});

var tm = function (){
  return new Date().toISOString() + ' ';
}

var read = thunkify(fs.readFile);

aa(function*(){
  yield aa(function*(){
    console.log(tm() + 'timer1');
    yield timer(300);
    console.log(tm() + 'timer2');
    yield timer(300);
    console.log(tm() + 'timer3');
  });

  yield aa(function*(){
    console.log(tm() + 't11');
    var t = timer(300);
    setTimeout(function (){
      console.log(tm() + 't12');
      t(function(){
        console.log(tm() + 't13');
      });
    }, 500);
  });

  yield aa(function*(){
    console.log(tm() + 't21');
    var t = timer(300);
    setTimeout(function (){
      console.log(tm() + 't22');
      t(function(){
        console.log(tm() + 't23');
      });
    }, 200);
  });

})();
