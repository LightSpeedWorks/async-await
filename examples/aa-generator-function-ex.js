(function () {
  var aa = require('../aa');
  //var aa = require('co');

  function *genFunc2() {
    console.log(yield [111]);
    console.log(yield [222]);
    console.log(yield [333]);
    console.log(999);
    return 999;
  }

  function *genFunc() {
    console.log(yield [11]);
    var val = yield genFunc2;
    if (val !== 999) throw new Error('unexpected 999 !== ' + val);
    console.log('xxx', val);
    console.log(yield [22]);
    val = yield genFunc2();
    if (val !== 999) throw new Error('unexpected 999 !== ' + val);
    console.log('yyy', val);
    console.log(yield [33]);
    console.log(99);
    return 99;
  }

  function makeCb(msg) {
    return function (val) { console.log(msg + ' ' + val); };
  }

  aa(genFunc  ).then(makeCb('xx val'), makeCb('xx err'));
  aa(genFunc()).then(makeCb('yy val'), makeCb('yy err'));

})();
