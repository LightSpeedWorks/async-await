// aa.js - async-await.js

(function () {
  'use strict';

  var util = require('util');
  var inspect = util.inspect;

  // GeneratorFunction
  try {
    var GeneratorFunction = Function('return function*(){}.constructor')();
  } catch(e) {
    var GeneratorFunction = null;
  }

  // isPromise
  function isPromise(p) {
    return p && typeof p.then === 'function'; }

  // isGenerator
  function isGenerator(gen) {
    return gen && typeof gen.next === 'function'; }

  // isGeneratorFunction
  function isGeneratorFunction(gfn) {
    return typeof gfn === 'function' &&
      gfn instanceof GeneratorFunction; }

  // aa - async-await
  function aa(gfn) {
    var ctx = this;
    var args = [].slice.call(arguments, 1);

    if (isGeneratorFunction(gfn))
      var gen = gfn.apply(ctx, args);
    else if (isGenerator(gfn))
      var gen = gfn;
    else if (isPromise(gfn))
      return gfn;
    // else chan
    else
      return aa.chan.apply(ctx, arguments);

    var resolve, reject;
    var p = new Promise(function (res, rej) {
      resolve = res, reject = rej;
    });

    var next = function next(err, val) {

      try {
        if (err) var ret = gen.throw(err);
        else     var ret = gen.next(val);
      } catch (err) {
        return reject(err);
      }

      if (ret.done)
        return resolve(ret.value);

      doValue(ret.value, next);

    }.bind(ctx);

    function doValue(value, next) {
      setImmediate(function () {
        var called;
        // generator function, generator or promise
        if (isGeneratorFunction(value) ||
            isGenerator(value) || isPromise(value))
          aa(value).then(
            function (val) { next(null, val); }, next);
        // function must be a thunk
        else if (typeof value === 'function')
          value.call(ctx, next);
        // array
        else if (value instanceof Array) {
          var n = value.length;
          var arr = Array(value.length);
          value.forEach(function (val, i) {
            doValue(val, function (err, val) {
              if (err) return next(err, arr), called = true;
              arr[i] = val;
              if (--n === 0 && !called)
                next(null, arr), called = true;
            });
          });
        }
        // object
        else if (value && typeof value === 'object') {
          var keys = Object.keys(value);
          var n = keys.length;
          var obj = {};
          keys.forEach(function (key) {
            obj[key] = void 0;
            doValue(value[key], function (err, val) {
              if (err) return next(err, obj), called = true;
              obj[key] = val;
              if (--n === 0 && !called)
                next(null, obj), called = true;
            });
          });
        }
        else // other value
          next(null, value);
      });
    }

    next(null /*first*/);

    // thunk
    var thunk = function (fn) {
      if (typeof fn === 'function')
        p.then(
          function (val) { fn(null, val); }, fn);
      else
        throw new Error('thunk must be a function');
    };

    thunk.then = p.then.bind(p);
    thunk['catch'] = p['catch'].bind(p);
    return thunk;
  }

  aa.chan     = require('co-chan');
  aa.thunkify = require('co-thunkify');

  exports = module.exports = aa;

})();
