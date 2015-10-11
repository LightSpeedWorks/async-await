'use strict';

var slice = Array.prototype.slice;

// function thunkify
function thunkify(fn) {
  return function () {
    var callback, results, called;
    var args = slice.call(arguments);
    args.push(function () {
      results = arguments;
      done();
    });
    // arguments[arguments.length++] = function () {
    //   results = arguments;
    //   done();
    // };
    fn.apply(null, args); // arguments);
    return function (fn) {
      callback = fn;
      done();
    };
    function done() {
      if (!callback || !results || called) return;
      called = true;
      callback.apply(null, results);
    }
  };
} // function thunkify

exports = module.exports = thunkify;
