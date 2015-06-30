(function () {
  'use strict';

  var util = require('util'), inspect = util.inspect;
  function ins(x) {
    return inspect(x, {colors: true});
  }

  try { var aa = require('../aa'); }
  catch (err) { var aa = require('aa'); }

  function coSleep(ms, val) {
    return function (fn) {
      setTimeout(function () {
        if (val < 3) fn(null, val);
        else         fn(new Error('sleep error'));
      }, ms);
    };
  }

  function promiseSleep(ms, val) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        if (val < 3) resolve(val);
        else         reject(new Error('sleep error'));
      }, ms);
    });
  }

  function clog(msg) {
    var args = [].slice.call(arguments, 1);
    console.log('\x1b[36m' + msg + '\x1b[m ' + args.map(ins).join(' '));
  }

  var p = aa.call('this', function *() {
    var args = [].slice.call(arguments);
    clog('gfn this:', this);
    clog('gfn args:', args);
    try {
      clog('coSleep(200, 1):', yield coSleep(200, 1));
      clog('coSleep(200, 2):', yield coSleep(200, 2));
      clog('coSleep(200, 3):', yield coSleep(200, 3));
    } catch (err) {
      clog('coSleep err?', err + '');
      console.log('\x1b[31m' + err.stack + '\x1b[m');
    }
    try {
      clog('promiseSleep(200, 1):', yield promiseSleep(200, 1));
      clog('promiseSleep(200, 2):', yield promiseSleep(200, 2));
      clog('promiseSleep(200, 3):', yield promiseSleep(200, 3));
    } catch (err) {
      clog('promiseSleep err?', err + '');
      console.log('\x1b[31m' + err.stack + '\x1b[m');
    }
    clog('[th,th]:', yield [coSleep(200, 1), coSleep(200, 2)]);
    clog('[pr,pr]:', yield [promiseSleep(200, 1), promiseSleep(200, 2)]);
    clog('[[pr,co,3]]:', yield [[promiseSleep(200, 1), coSleep(200, 2), 3]]);

    clog('{x:th,y:th}:', yield {x:coSleep(200, 1), y:coSleep(200, 2)});
    clog('{x:pr,y:pr}:', yield {x:promiseSleep(200, 1), y:promiseSleep(200, 2)});
    clog('{w:{x:pr,y:co,z:3}}:', yield {w:{x:promiseSleep(200, 1), y:coSleep(200, 2), z:3}});

    throw new Error('gfn error');
    //return 'gfn last';
  }, 'args0');

  if (typeof p === 'function')
    p(function (err, val) { clog('thunk final:', err, val); });
  else if (p && typeof p.then === 'function')
    p.then(function (val) { clog('promise final ok:', val); },
           function (err) { clog('promise final ng:', err); });
  else
    console.log(p);

})();
