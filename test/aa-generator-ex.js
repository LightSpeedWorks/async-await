// aa-generator-ex.js

(function () {

  var aa = require('../aa');
  //var aa = require('co');

  var slice = [].slice;

  var startTime = Date.now();
  var counter = 0;
  var fired = true;
  var timer = setInterval(function () { fired = true; }, 1000);

  // pr(msgs...)
  function pr() {
    if (fired) {
      console.log(counter + '\t' + slice.call(arguments).join(' '));
      fired = false;
    }
  }

  // delay thunk
  function delay(ms, val) {
    return function (cb) {
      ++counter;
      function callback() {
        cb(null, val);
      }
      if (ms <= 0) setImmediate(callback);
      else setTimeout(callback, ms);
    };
  }

  var ms = 0;
  var depth = 18;

  // gen1 generator
  function * gen1(indent, indentString) {
    if (!indent) indent = 0;
    pr(yield delay(ms, indentString + indent + ': a'));
    if (indent < depth) yield gen1(indent + 1, indentString + '  ');
    pr(yield delay(ms, indentString + indent + ': b'));
    if (indent < depth) yield gen1(indent + 1, indentString + '  ');
    pr(yield delay(ms, indentString + indent + ': c'));
    return indentString + indent + ': ret';
  }

  aa(function * () {
    pr('000: init');
    pr(yield delay(ms, '111: start'));
    pr(yield gen1(0, '  '));
    pr(yield delay(ms, '999: end'));
    pr('ZZZ:', counter);
    clearInterval(timer);
    console.log(counter + '\ttime: ' + (Date.now() - startTime) / 1000.0 + ' sec');
    return counter;
  }).then(
    function (val) { console.log(counter + '\tval: ' + val); },
    function (err) { console.log(counter + '\terr: ' + err); });

})();
