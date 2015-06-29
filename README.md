[aa](https://www.npmjs.com/package/aa) - async await
====

  [aa](https://www.npmjs.com/package/aa) - Async-Await library.<br/>
  co like library, go like channel, thunkify or promisefy wrap package.

  using ES6 (ES2015) generator function.

  compatible with co@3 and co@4.


INSTALL:
----

```bash
$ npm install aa
```


PREPARE:
----

```js
  var aa = require('aa');
```


USAGE:
----

  Quick sample code: [aa-readme-example.js](examples/aa-readme-example.js#readme)

```bash
$ iojs aa-readme-example.js
```


```js
  var aa = require('aa');


  // sleep(ms, args,... cb) : node style normal callback
  function sleep(ms) {
    var args = [].slice.call(arguments, 1);
    setTimeout.apply(null, [args.pop(), ms, null].concat(args));
  }

  sleep(1000, function (err, val) { console.log('1000 ms OK'); });


  // delay(ms, args,...)(cb) : thunk
  function delay(ms) {
    var args = [].slice.call(arguments);
    return function (cb) {
      sleep.apply(null, args.concat(cb));
    };
  }

  delay(1100)(
    function (err, val) { console.log('1100 ms OK'); }
  );


  // aa(fn) | aa.wrap(fn) : returns wrapped function a.k.a thunkify and promisefy
  // wait(ms, args,...)   : returns promise & thunk
  var wait = aa(sleep);

  // wait() : as a thunk
  wait(1200)(
    function (err, val) { console.log('1200 ms OK'); }
  );

  // wait() : as a promise
  wait(1300).then(
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
    yield wait(800);


    console.log('0:', yield wait(300, 0));
    console.log('1:', yield wait(300, 1));


    // yield Promise.all([])
    console.log('[1, 2, 3]:',
      yield Promise.all([wait(200, 1), wait(300, 2), wait(100, 3)]));


    // yield [] -> like Promise.all([]) !
    console.log('[4, 5, 6]:',
      yield [wait(200, 4), wait(300, 5), wait(100, 6)]);


    // yield {} -> like Promise.all({}) !?
    console.log('{x:7, y:8, z:9}:',
      yield {x:wait(200, 7), y:wait(300, 8), z:wait(100, 9)});


    // make channel for sync - fork and join
    var chan = aa(); // or aa.chan()

    sleep(300, 20, chan);   // send value to channel
    sleep(200, 10, chan);   // send value to channel
    var a = yield chan;     // recv value from channel
    var b = yield chan;     // recv value from channel
    console.log('10 20:', a, b);


    // fork thread -  make new thread and start
    aa(function *() {
      yield wait(200);      // wait 200 ms
      return 200;
    })(chan);               // send 200 to channel

    // fork thread -  make new thread and start
    aa(function *() {
      yield wait(100);      // wait 100 ms
      return 100;
    })(chan);               // send 100 to channel

    // fork thread -  make new thread and start
    aa(function *() {
      yield wait(300);      // wait 300
      return 300;
    })(chan);               // send 300 to channel

    // join threads - sync threads
    var x = yield chan;     // wait & recv first  value from channel
    var y = yield chan;     // wait & recv second value from channel
    var z = yield chan;     // wait & recv third  value from channel
    console.log('top 3 winners: 100 200 300:', x, y, z);


    // communicate with channels
    var chan1 = aa(), chan2 = aa();

    // thread 1: send to chan1, recv from chan2
    aa(function *() {
      sleep(100, 111, chan1);
      console.log('222:', yield chan2);
      sleep(100, 333, chan1);
      console.log('444:', yield chan2);
      sleep(100, 555, chan1);
      return 666;
    })(chan);

    // thread 1: recv from chan1, send to chan2
    aa(function *() {
      console.log('111:', yield chan1);
      sleep(100, 222, chan2);
      console.log('333:', yield chan1);
      sleep(100, 444, chan2);
      console.log('555:', yield chan1);
      return 777;
    })(chan);
    console.log('666 777:', yield chan, yield chan);

    return 11;
  })
  .then(
    function (val) {
      console.log('11 val:', val);
      return wait(100, 22); },
    function (err) {
      console.log('11 err:', err);
      return wait(100, 22); }
  )
  (function (err, val) {
      console.log('22 val:', val, err ? 'err:' + err : '');
      return wait(100, 33); })
  (function (err, val) {
      console.log('33 val:', val, err ? 'err:' + err : '');
      return wait(100, 44); })
  .then(
    function (val) {
      console.log('44 val:', val);
      return wait(100, 55); },
    function (err) {
      console.log('44 err:', err);
      return wait(100, 55); }
  )
  .catch(
    function (err) {
      console.log('55 err:', err);
      return wait(100, 66); }
  );
```


LICENSE:
----

  MIT
