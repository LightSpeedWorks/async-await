// thunkify.js

(function () {
'use strict';

// thunkify(fn) or
// thunkify(ctx, fn) or
// thunkify.call(ctx, fn)
function thunkify(ctx, fn) {
  // fn
  if (typeof fn !== 'function') {
    fn = ctx;
    ctx = this;
  }
  // ctx, fn
  if (typeof fn !== 'function') {
    throw new TypeError('argument must be a function');
  }

  return function () {
    var cb, results, called;

    arguments[arguments.length++] = function () {
      if (!results) results = arguments;
      if (!cb || called) return;
      called = true;
      cb.apply(ctx, results);
    };

    fn.apply(ctx, arguments);

    return function (fn) {
      if (!cb) cb = fn;
      if (!results || called) return;
      called = true;
      cb.apply(ctx, results);
    };
  };
}

exports = module.exports = thunkify;

})();
