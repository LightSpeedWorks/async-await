// trace.js

(function () {
'use strict';

function trace(fn, msg) {
  return function () {
    console.log(new Date().toISOString() + ' ' + msg + ' start ' +
      require('util').inspect([].slice.call(arguments),{colors:true}));
    var result = fn.apply(this, arguments);
    console.log(new Date().toISOString() + ' ' + msg + ' end');
    return result;
  };
}

exports = module.exports = trace;

})();
