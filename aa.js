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

  var aacount = 0;

  // aa
  function aa(gtor) {
    var ctx = this;
    var args = slice.call(arguments, 1);

    // is generator function? then get generator.
    if (isGeneratorFunction(gtor))
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

    var gtors = [];

    console.log('aa *************************************************' + (++aacount));

    var resolve2, reject2, p = PromiseThunk(
      function (res, rej) { resolve2 = res; reject2 = rej; });

    function resolve(val) {
      gtor = gtors.pop();
      if (!gtor) return resolve2(val);
      return nextTickDo(function () { next(null, val); });
    }

    function reject(err) {
      //if (!(err instanceof Error)) console.log('aa reject: ', typeof err, err.constructor.name, err);
      gtor = gtors.pop();
      if (!gtor) return reject2(err);
      //console.log('@@@@' + err.stack);
      return nextTickDo(function () { next(err); });
    }

    p.then(
      function (val) {
        console.log('aa -------------------------------------------------' + (aacount--) + ' val: ' + val); },
      function (err) {
        console.log('aa -------------------------------------------------' + (aacount--) + ' err: ' + err); });

    function next(err, val) {
      //console.log('\x1b[43merr&val', typeof err, err+'', typeof val, '\x1b[m');
      try {
        if (err) {
          //if (!(err instanceof Error)) console.log('aa next err: ', typeof err, err.constructor.name, err);
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

      doValue(ret.value, next);
    }

    function doValue(value, next) {
      if  (value == null || typeof value !== 'object' && typeof value !== 'function')
        return next(null, value);

      if (isGeneratorFunction(value))
        value = value.apply(ctx, args);

      if (isGenerator(value))
        return gtors.push(gtor), gtor = value, nextTickDo(next);

      if (value instanceof PromiseThunk)
        return value(next);

      if (isPromise(value))
        return value.then(function (val) { next(null, val); }, next);

      // function must be a thunk
      if (typeof value === 'function')
        return value(next);

      var called;

      // array
      if (value instanceof Array) {
        var n = value.length;
        if (n === 0) return next(null, []);
        var arr = Array(n);
        value.forEach(function (val, i) {
          doValue(val, function (err, val) {
            if (err) {
              if (!called)
                called = true, next(err);
            }
            else {
              arr[i] = val;
              if (--n === 0 && !called)
                called = true, next(null, arr);
            }
          });
        });
      }

      // object
      else if (value && typeof value === 'object') {
        var keys = Object.keys(value);
        var n = keys.length;
        if (n === 0) return next(null, {});
        var obj = {};
        keys.forEach(function (key) {
          obj[key] = undefined;
          doValue(value[key], function (err, val) {
            if (err) {
              if (!called)
                called = true, next(err);
            }
            else {
              obj[key] = val;
              if (--n === 0 && !called)
                called = true, next(null, obj);
            }
          });
        });
      }

      // other value
      else
        throw new Error('aa: %%%%%%');
      //  next(null, value);
    }

    nextTickDo(next);

    return p;
  }

  // isGeneratorFunction
  function isGeneratorFunction(gtor) {
    return !!gtor && gtor instanceof GeneratorFunction;
  }

  // isGenerator
  function isGenerator(gtor) {
    return !!gtor && typeof gtor.next === 'function';
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
