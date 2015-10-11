'use strict';

function thunkify(fn) {
  return function () {
    var callback, results, called, context;
    arguments[arguments.length++] = function () {
      results = arguments;
      context = this;
      if (!callback || called) return;
      called = true;
      callback.apply(context, results);
    };

    fn.apply(this, arguments);

    return function (fn) {
      callback = fn;
      if (!results || called) return;
      called = true;
      callback.apply(context, results);
    };
  };
}

exports = module.exports = thunkify;
