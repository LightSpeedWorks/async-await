[aa](https://www.npmjs.com/package/aa) - async await
====

  async await library.

  using ES6 (ES2015) generator function.

INSTALL:
----

```bash
$ npm install aa
```

USAGE:
----

  Quick sample code: [aa-readme-example.js](examples/aa-readme-example.js#readme)

```bash
$ iojs aa-readme-example.js
```


```js
  var aa = require('aa');


  // wait(ms, args,... cb) : node style normal callback
  function wait(ms) {
    var args = [].slice.call(arguments, 1);
    setTimeout.apply(null, [args.pop(), ms, null].concat(args));
  }

  wait(1000, function (err, val) { console.log('1000 ms OK'); });


  // delay(ms, args,...)(cb) : thunk
  function delay(ms) {
    var args = [].slice.call(arguments);
    return function (cb) {
      wait.apply(null, args.concat(cb));
    };
  }

  delay(1100)(
    function (err, val) { console.log('1100 ms OK'); }
  );


  // aa(fn) | aa.wrap(fn) : returns wrapped function a.k.a thunkify and promisefy
  // sleep(ms, args,...)  : returns promise & thunk
  var sleep = aa(wait);

  // sleep() : as a thunk
  sleep(1200)(
    function (err, val) { console.log('1200 ms OK'); }
  );

  // sleep() : as a promise
  sleep(1300).then(
    function (val) { console.log('1300 ms OK'); },
    function (err) { console.log('1300 ms NG', err); }
  ).catch(
    function (err) { console.log('1300 ms NG2', err); }
  );


  // aa(generator) : returns promise & thunk
  aa(function *() {

    yield 1;                    // primitive value
    yield [1, 2, 3];            // array
    yield {x:1, y:2, z:3};      // object


    // wait for promise
    yield Promise.resolve(2);


    // wait for thunk
    yield delay(800);


    // wait for promise or thunk
    yield sleep(800);


    console.log('0:', yield sleep(300, 0));
    console.log('1:', yield sleep(300, 1));


    // yield Promise.all([])
    console.log('[1, 2, 3]:',
      yield Promise.all([sleep(200, 1), sleep(300, 2), sleep(100, 3)]));


    // yield [] -> like Promise.all([]) !
    console.log('[4, 5, 6]:',
      yield [sleep(200, 4), sleep(300, 5), sleep(100, 6)]);


    // yield {} -> like Promise.all({}) !?
    console.log('{x:7, y:8, z:9}:',
      yield {x:sleep(200, 7), y:sleep(300, 8), z:sleep(100, 9)});


    // make channel for sync - fork and join
    var chan = aa(); // or aa.chan()

    wait(300, 20, chan);    // send value to channel
    wait(200, 10, chan);    // send value to channel
    var a = yield chan;     // recv value from channel
    var b = yield chan;     // recv value from channel
    console.log('10 20:', a, b);


    // fork thread -  make new thread and start
    aa(function *() {
      yield sleep(200);     // sleep 200
      return 200;
    })(chan);               // send 200 to channel

    // fork thread -  make new thread and start
    aa(function *() {
      yield sleep(100);     // sleep 100
      return 100;
    })(chan);               // send 100 to channel

    // fork thread -  make new thread and start
    aa(function *() {
      yield sleep(300);     // sleep 300
      return 300;
    })(chan);               // send 300 to channel

    // join threads - sync threads
    var x = yield chan;     // wait and recv first  value from channel
    var y = yield chan;     // wait and recv second value from channel
    var z = yield chan;     // wait and recv third  value from channel
    console.log('top 3 winners: 100 200 300:', x, y, z);


    // communicate with channels
    var chan1 = aa(), chan2 = aa();

    // thread 1: send to chan1, recv from chan2
    aa(function *() {
      wait(100, 111, chan1);
      console.log('222:', yield chan2);
      wait(100, 333, chan1);
      console.log('444:', yield chan2);
      wait(100, 555, chan1);
      return 666;
    })(chan);

    // thread 1: recv from chan1, send to chan2
    aa(function *() {
      console.log('111:', yield chan1);
      wait(100, 222, chan2);
      console.log('333:', yield chan1);
      wait(100, 444, chan2);
      console.log('555:', yield chan1);
      return 777;
    })(chan);
    console.log('666 777:', yield chan, yield chan);

    return 11;
  })
  .then(
    function (val) {
      console.log('11 val:', val);
      return sleep(100, 22); },
    function (err) {
      console.log('11 err:', err);
      return sleep(100, 22); }
  )
  (function (err, val) {
      console.log('22 val:', val, err ? 'err:' + err : '');
      return sleep(100, 33); })
  (function (err, val) {
      console.log('33 val:', val, err ? 'err:' + err : '');
      return sleep(100, 44); })
  .then(
    function (val) {
      console.log('44 val:', val);
      return sleep(100, 55); },
    function (err) {
      console.log('44 err:', err);
      return sleep(100, 55); }
  )
  .catch(
    function (err) {
      console.log('55 err:', err);
      return sleep(100, 66); }
  );
```

LICENSE:
----

  MIT
