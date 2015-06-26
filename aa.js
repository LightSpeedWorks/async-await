// aa.js - async-await.js

this.aa = function () {
  var PromiseThunk = require('promise-thunk');
  var chan = require('co-chan');
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
      //throw new TypeError('arguments must be Generator or GeneratorFunction');

    var uniqId = 100; // unique id for debug

    var resolve, reject;
    var p = PromiseThunk(
      function (res, rej) { resolve = res; reject = rej; });

    function next(err, val) {
      //console.log('\x1b[43merr&val', typeof err, err+'', typeof val, '\x1b[m');
      try {
        if (err) var ret = gtor['throw'](err);
        else     var ret = gtor.next(val);
      } catch (err) {
        return reject(err);
      }

      //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      //var xyz = ret && ret.value;
      var id = uniqId++;

      //console.log('\x1b[44m    ret', id, typeof xyz,
      //  ':', (xyz && xyz.hasOwnProperty('toString') && xyz + '') ||
      //       (xyz && typeof xyz === 'function' && 'function' || xyz),
      //  (ret && ret.done && '!!done!!' || ''), '\x1b[m');

      if (ret.done)
        return resolve(ret.value);

      doValue(ret.value, next, id);
    }

    function doValue(value, next, id) {

      //var xyz = value;

      // generator function, generator or promise
      if (isGeneratorFunction(value) ||
          isGenerator(value) || isPromise(value))
        return aa.call(ctx, value)(next);

      // function must be a thunk
      if (typeof value === 'function')
        return value(next);

      setImmediate(function () {
        var called;

        //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        //console.log('\x1b[46m    xyz', id, typeof xyz,
        //  ':', (xyz && xyz.hasOwnProperty('toString') && xyz + '') ||
        //       (xyz && typeof xyz === 'function' && 'function'|| xyz), '\x1b[m');

        // array
        if (value instanceof Array) {
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

        // other value
        else
          next(null, value);
      });
    }

    next(null);

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
