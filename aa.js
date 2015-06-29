// aa.js - async-await.js

this.aa = function () {
  var PromiseThunk = require('promise-thunk');
  var chan = require('./chan');
  var isPromise = PromiseThunk.isPromise;
  var wrap = PromiseThunk.wrap;

  // GeneratorFunction
  try {
    var GeneratorFunction = Function('return function*(){}.constructor')();
  } catch (e) {}

  // GeneratorFunctionPrototype
  try {
    var GeneratorFunctionPrototype = Function('return (function*(){})().constructor')();
  } catch (e) {}

  var slice = [].slice;

  // defProp
  var defProp = function (obj) {
    if (!Object.defineProperty) return null;
    try {
      Object.defineProperty(obj, 'prop', {value: 'str'});
      return obj.prop === 'str' ? Object.defineProperty : null;
    } catch (err) { return null; }
  } ({});

  // setConst(obj, prop, val)
  var setConst = defProp ?
    function setConst(obj, prop, val) {
      defProp(obj, prop, {value: val}); } :
    function setConst(obj, prop, val) { obj[prop] = val; };

  // setValue(obj, prop, val)
  var setValue = defProp ?
    function setValue(obj, prop, val) {
      defProp(obj, prop, {value: val,
        writable: true, configurable: true}); } :
    function setValue(obj, prop, val) { obj[prop] = val; };

  // nextTickDo(fn)
  var nextTickDo = typeof setImmediate === 'function' ? setImmediate :
    typeof process === 'object' && process && typeof process.nextTick === 'function' ? process.nextTick :
    function nextTick(fn) { setTimeout(fn, 0); };

  var tasks = [];
  var nextTickProgress = false;

  // nextTick(fn, ctx, ...args)
  function nextTick(fn, ctx, args) {
    if (typeof fn !== 'function')
      throw new TypeError('fn must be a function');

    tasks.push(arguments);
    if (nextTickProgress) return;

    nextTickProgress = true;
    nextTickDo(function () {
      var args;
      while (args = tasks.shift()) {
        var fn = args[0], ctx = args[1];
        fn.apply(ctx, slice.call(args, 2));
      }
      nextTickProgress = false;
    });
  }

  // aa - async-await
  function aa(gtor) {
    var ctx = this, args = slice.call(arguments, 1);

    // is generator function? then get generator.
    if (gtor instanceof GeneratorFunction)
      gtor = gtor.apply(ctx, args);

    // is promise? then do it.
    if (isPromise(gtor))
      return PromiseThunk(gtor);

    // is function? then wrap it.
    if (typeof gtor === 'function')
      return wrap.call(ctx, gtor);

    // is not generator?
    if (!isGenerator(gtor))
      return chan.apply(ctx, arguments);

    var resolve, reject, p = PromiseThunk(
      function (res, rej) { resolve = res; reject = rej; });

    nextTick(callback);
    return p;

    function callback(err, val) {
      try {
        if (err) {
          if (typeof gtor['throw'] !== 'function')
            return reject(err);
          var ret = gtor['throw'](err);
        }
        else
          var ret = gtor.next(val);
      } catch (err) {
        return reject(err);
      }

      if (ret.done)
        return resolve(ret.value);

      nextTick(doValue, null, ret.value, callback);
    }

    function doValue(value, callback) {
      if  (value == null ||
           typeof value !== 'object' &&
           typeof value !== 'function')
        return callback(null, value);

      if (value instanceof GeneratorFunction)
        value = value.apply(ctx, args);

      if (value instanceof GeneratorFunctionPrototype || isGenerator(value))
        return aa.call(ctx, value)(callback);

      if (value instanceof PromiseThunk)
        return value(callback);

      if (isPromise(value))
        return value.then(function (val) { callback(null, val); }, callback);

      // function must be a thunk
      if (typeof value === 'function')
        return value(callback);

      var called = false;

      // array
      if (value instanceof Array) {
        var n = value.length;
        if (n === 0) return callback(null, []);
        var arr = Array(n);
        value.forEach(function (val, i) {
          doValue(val, function (err, val) {
            if (err) {
              if (!called)
                called = true, callback(err);
            }
            else {
              arr[i] = val;
              if (--n === 0 && !called)
                called = true, callback(null, arr);
            }
          });
        });
      } // array

      // object
      else if (value.constructor === Object) {
        var keys = Object.keys(value);
        var n = keys.length;
        if (n === 0) return callback(null, {});
        var obj = {};
        keys.forEach(function (key) {
          obj[key] = undefined;
          doValue(value[key], function (err, val) {
            if (err) {
              if (!called)
                called = true, callback(err);
            }
            else {
              obj[key] = val;
              if (--n === 0 && !called)
                called = true, callback(null, obj);
            }
          });
        });
      } // object

      // other value
      else
        return callback(null, value);
    }
  }

  // isGeneratorFunction
  function isGeneratorFunction(gtor) {
    return gtor instanceof GeneratorFunction;
  }

  // isGenerator
  function isGenerator(gtor) {
    return gtor instanceof GeneratorFunctionPrototype || !!gtor && gtor.next === 'function';
  }

  if (typeof module === 'object' && module && module.exports)
    module.exports = aa;

  if (GeneratorFunction)
    aa.GeneratorFunction = GeneratorFunction;

  aa.isGeneratorFunction = isGeneratorFunction;
  aa.isGenerator  = isGenerator;
  aa.aa           = aa;
  aa.chan         = chan;

  if (Object.getOwnPropertyNames)
    Object.getOwnPropertyNames(PromiseThunk).forEach(function (prop) {
      if (!aa.hasOwnProperty(prop))
        setValue(aa, prop, PromiseThunk[prop]);
    });
  else
    for (var prop in PromiseThunk)
      if (!aa.hasOwnProperty(prop))
        setValue(aa, prop, PromiseThunk[prop]);

  return aa;

}();
