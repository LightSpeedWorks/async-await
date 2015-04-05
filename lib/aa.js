// aa.js - async-await.js

(function () {
  'use strict';

  var util = require('util');
  var inspect = util.inspect;

  // aa - async-await
  function aa(gfn) {
    if (typeof gfn !== 'function' ||
        gfn.constructor.name !== 'GeneratorFunction') {
      return aa.chan.apply(this, arguments);
    }

    var ctx = this;
    var args = [].slice.call(arguments, 1);
    var gen = gfn.apply(ctx, args);

    var resolve, reject;
    var p = new Promise(function (res, rej) {
      resolve = res, reject = rej;
    });

    var next = function next(err, val) {

      try {
        if (err) var ret = gen.throw(err);
        else     var ret = gen.next(val);
      } catch (err) {
        return reject.call(ctx, err);
      }

      if (ret.done)
        return resolve.call(ctx, ret.value);

      doValue(ret.value, next);

    }.bind(ctx);

    function doValue(value, next) {
      setImmediate(function () {
        var called;
        // thunk
        if (typeof value === 'function')
          value.call(ctx, next);
        // promise
        else if (value instanceof Promise) {
          value.then(
            function (val) { next(null, val); },
            function (err) { next(err);
          });
        }
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

    // promise
    if (false)
      return p;
    // thunk
    return function (fn) {
      if (typeof fn === 'function')
        p.then(function (val) {
          fn(null, val);
        }, function (err) {
          fn(err);
        });
    };
  }

  aa.chan     = require('co-chan');
  aa.thunkify = require('co-thunkify');

  exports = module.exports = aa;

})();
