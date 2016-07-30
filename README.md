[aa](https://www.npmjs.com/package/aa) - [async-await](https://www.npmjs.com/package/async-await)
====

[![Join the chat at https://gitter.im/LightSpeedWorks/async-await](https://badges.gitter.im/LightSpeedWorks/async-await.svg)](https://gitter.im/LightSpeedWorks/async-await?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

  co like library, go like channel, thunkify or promisify wrap package.

  using ES6 (ES2015) generator function.

  compatible with co@3 and co@4.


INSTALL:
----

```bash
$ npm install aa --save
   or
$ npm install async-await --save
```

[![NPM](https://nodei.co/npm/aa.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/aa/)
[![NPM](https://nodei.co/npm-dl/aa.png?height=2)](https://nodei.co/npm/aa/)
[![NPM](https://nodei.co/npm/async-await.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/async-await/)
[![NPM](https://nodei.co/npm-dl/async-await.png?height=2)](https://nodei.co/npm/async-await/)


PREPARE:
----

```js
  var aa = require('aa');
  // or
  var aa = require('async-await');

  var promisify    = aa.promisify;
  var thunkify     = aa.thunkify;
  var promisifyAll = aa.promisifyAll;
  var thunkifyAll  = aa.thunkifyAll;
  var Channel      = aa.Channel;

  var Promise      = aa.Promise;      // override native Promise
  var PromiseThunk = aa.PromiseThunk; // use PromiseThunk indivisually
```

or

https://lightspeedworks.github.io/promise-thunk/promise-thunk.js <br/>
https://lightspeedworks.github.io/aa/aa.js

```html
<script src="https://lightspeedworks.github.io/promise-thunk/promise-thunk.js"></script>
<script src="https://lightspeedworks.github.io/aa/aa.js"></script>
```

USAGE:
----

### aa(generator or generator function) 

  `aa()` returns promise (thunkified promise).

  basic usage. <br>
  you can `aa()` promises, generators, and generator functions.

```js
aa(function *() {
	// *** SEQUENTIAL EXECUTION ***

	// yield value returns itself
	yiled 1;
	yiled [1, 2, 3];
	yiled {x:1, y:2, z:3};

	// yield promise returns resolved value
	yield Promise.resolve(1);

	// or throws rejected error
	try { yield Promise.reject(new Error('expected')); }
	catch (e) { console.error('%s', e); }

	// *** PARALLEL EXECUTION ***

	// yield an array of promises waits all promises and returns resolved array
	yield [Promise.resolve(1), Promise.resolve(2)];

	// yield an object of promises waits all promises and returns resolved object
	yield {x: Promise.resolve(1), y: Promise.resolve(2)};

	// *** OTHERS AND COMBINED OPERATIONS ***

	// yield thunk
	// yield generator or generator function
	// yield channel for event stream
});
```


### aa.promisify([ctx,] fn, [options])

  `promisify()` converts node style function into a function returns promise-thunk. <br>
  you can use `fs.exists()` and `child_process.exec()` also.

  + `ctx`: context object. default: this or undefined.
  + `fn`: node-style normal function.
  + `options`: options object.
    + `context`: context object.

  also thenable, yieldable, callable.

#### postgres `pg` example:

```js
var pg = require('pg');
var pg_connect = aa.promisify(pg, pg.connect);         // -> yield pg_connect()
var client_query = aa.promisify(client, client.query); // -> yield client_query()
```

### aa.promisify(object, method, [options])

  `promisify()` defines method promisified function returns promise-thunk.

  + `object`: target object.
  + `method`: method name string.
  + `options`: method name suffix or postfix. default: 'Async'. or options object.
    + `suffix`: method name suffix or postfix. default: 'Async'.
    + `postfix`: method name suffix or postfix. default: 'Async'.

#### postgres `pg` example:

```js
var pg = require('pg');
aa.promisify(pg, 'connect', {suffix: 'A'};             // -> yield pg.connectA()
aa.promisify(pg.Client.prototype, 'connect'); // -> yield client.connectAsync()
aa.promisify(pg.Client.prototype, 'query');   // -> yield client.queryAsync()
```

### aa.promisifyAll(object, [options])

  `promisifyAll()` defines all methods promisified function returns promise-thunk.

  + `object`: target object.
  + `options`: method name suffix or postfix. default: 'Async'. or options object.
    + `suffix`: method name suffix or postfix. default: 'Async'.
    + `postfix`: method name suffix or postfix. default: 'Async'.

#### file system `fs` example:

```js
var fs = require('fs');
aa.promisifyAll(fs, {suffix: 'A'});  // -> yield fs.readFileA()
```

#### postgres `pg` example:

```js
var pg = require('pg');
aa.promisifyAll(pg.constructor.prototype, {suffix: 'A'});  // -> yield pg.connectA()
aa.promisifyAll(pg.Client.prototype);  // -> yield client.connectAsync()
                                       // -> yield client.queryAsync()
```

### aa.thunkify([ctx,] fn, [options])

  `thunkify()` converts node style function into a thunkified function. <br>
  you can use `fs.exists()` and `child_process.exec()` also.

  + `ctx`: context object. default: this or undefined.
  + `fn`: node-style normal function with callback.
  + `options`: options object.
    + `context`: context object.

  also yieldable, callable.

#### postgres `pg` example:

```js
var pg = require('pg');
var pg_connect = aa.thunkify(pg, pg.connect);         // -> yield pg_connect()
var client_query = aa.thunkify(client, client.query); // -> yield client_query()
```

### aa.thunkify(object, method, [options])

  `thunkify()` defines method thunkified function returns thunk.

  + `object`: target object.
  + `method`: method name string.
  + `options`: method name suffix or postfix. default: 'Async'. or options object.
    + `suffix`: method name suffix or postfix. default: 'Async'.
    + `postfix`: method name suffix or postfix. default: 'Async'.

#### postgres `pg` example:

```js
var pg = require('pg');
aa.thunkify(pg, 'connect', {suffix: 'A'});  // -> yield pg.connectA()
aa.thunkify(pg.Client.prototype, 'connect'); // -> yield client.connectAsync()
aa.thunkify(pg.Client.prototype, 'query');   // -> yield client.queryAsync()
```

### aa.thunkifyAll(object, [options])

  `thunkifyAll()` defines all methods thunkified function returns thunk.

  + `object`: target object.
  + `options`: method name suffix or postfix. default: 'Async'. or options object.
    + `suffix`: method name suffix or postfix. default: 'Async'.
    + `postfix`: method name suffix or postfix. default: 'Async'.

#### file system `fs` example:

```js
var fs = require('fs');
aa.thunkifyAll(fs, {suffix: 'A'});  // -> yield fs.readFileA()
```

#### postgres `pg` example:

```js
var pg = require('pg');
aa.thunkifyAll(pg.constructor.prototype, {suffix: 'A'});  // -> yield pg.connectA()
aa.thunkifyAll(pg.Client.prototype);  // -> yield client.connectAsync()
                                      // -> yield client.queryAsync()
```

### aa.Channel() : new channel for event stream

`Channel()` returns a new channel for event stream. <br>
use a channel for node style function as a callback. <br>
yield channel for wait it.  <br>


### yield : waits and returns resolved value.

you can `yield` promises, thunkified functions,
generators, generator functions,
primitive values, arrays, and objects. <br>


### aa.callback(gtor) : returns callback function

`callback(gtor)` returns normal callback function

```js
http.createServer(aa.callback(function *(req, res) {
	yield aa.wait(1000);
	res.end('delayed hello');
})).listen(process.env.PORT || 8000);
```

EXAMPLES:
----

### Example 1 sequential: [aa-readme-ex01-seq.js](examples/aa-readme-ex01-seq.js#readme)

```bash
$ node aa-readme-ex01-seq.js
```

```js
	var aa = require('aa');


	aa(main);


	function *main() {
		console.log('11:', yield asyncPromise(100, 11));
		console.log('12:', yield asyncThunk(100, 12));
		console.log('13:', yield asyncGenerator(100, 13));
		yield sub(20);
		yield sub(30);
	}


	function *sub(base) {
		console.log('%s: %s', base + 1, yield asyncPromise(100, base + 1));
		console.log('%s: %s', base + 2, yield asyncThunk(100, base + 2));
		console.log('%s: %s', base + 3, yield asyncGenerator(100, base + 3));
	}


	// asyncPromise(msec, arg) : promise
	function asyncPromise(msec, arg) {
		return new Promise(function (resolve, reject) {
			setTimeout(resolve, msec, arg);
		});
	}


	// asyncThunk(msec, arg) : thunk
	function asyncThunk(msec, arg) {
		return function (callback) {
			setTimeout(callback, msec, null, arg);
		};
	}


	// asyncGenerator(msec, arg) : generator
	function *asyncGenerator(msec, arg) {
		var chan = aa.Channel();
		setTimeout(chan, msec, arg);
		return yield chan;
	}
```


### Example 2 parallel: [aa-readme-ex02-par.js](examples/aa-readme-ex02-par.js#readme)

```bash
$ node aa-readme-ex02-par.js
```

```js
	var aa = require('aa');


	aa(main);


	function *main() {
		console.log('[11, 12, 13]:', yield [
			asyncPromise(100, 11),
			asyncThunk(100, 12),
			asyncGenerator(100, 13)
		]);

		console.log('{x:11, y:12, z:13}:', yield {
			x: asyncPromise(100, 11),
			y: asyncThunk(100, 12),
			z: asyncGenerator(100, 13)
		});

		yield [sub(20), sub(30)];
	}


	function *sub(base) {
		console.log('%s: %s', base + 1, yield asyncPromise(100, base + 1));
		console.log('%s: %s', base + 2, yield asyncThunk(100, base + 2));
		console.log('%s: %s', base + 3, yield asyncGenerator(100, base + 3));
	}


	// asyncPromise(msec, arg) : promise
	function asyncPromise(msec, arg) {
		return new Promise(function (resolve, reject) {
			setTimeout(resolve, msec, arg);
		});
	}


	// asyncThunk(msec, arg) : thunk
	function asyncThunk(msec, arg) {
		return function (callback) {
			setTimeout(callback, msec, null, arg);
		};
	}


	// asyncGenerator(msec, arg) : generator
	function *asyncGenerator(msec, arg) {
		var chan = aa.Channel();
		setTimeout(chan, msec, arg);
		return yield chan;
	}
```


### Example promisify: [aa-readme-ex11-promisify.js](examples/aa-readme-ex11-promisify.js#readme)

```bash
$ node aa-readme-ex11-promisify.js
```

```js
	var aa = require('aa');
	var promisify = aa.promisify;
	var asyncPromise = promisify(asyncCallback);


	aa(main);


	function *main() {
		console.log('11:', yield asyncPromise(100, 11));
		console.log('12:', yield asyncPromise(100, 12));
		console.log('13:', yield asyncPromise(100, 13));

		asyncPromise(100, 21)
		.then(function (val) {
			console.log('21:', val);
			return asyncPromise(100, 22);
		})
		.then(function (val) {
			console.log('22:', val);
			return asyncPromise(100, 23);
		})
		.then(function (val) {
			console.log('23:', val);
		});
	}


	// asyncCallback(msec, arg. callback) : node style normal callback
	// callback : function (err, val)
	function asyncCallback(msec, arg, callback) {
		setTimeout(callback, msec, null, arg);
	}
```


### Example thunkify: [aa-readme-ex12-thunkify.js](examples/aa-readme-ex12-thunkify.js#readme)

```bash
$ node aa-readme-ex12-thunkify.js
```

```js
	var aa = require('aa');
	var thunkify = aa.thunkify;
	var asyncThunk = thunkify(asyncCallback);


	aa(main);


	function *main() {
		console.log('11:', yield asyncThunk(100, 11));
		console.log('12:', yield asyncThunk(100, 12));
		console.log('13:', yield asyncThunk(100, 13));

		asyncThunk(100, 21)
		(function (err, val) {
			console.log('21:', val);
			asyncThunk(100, 22)
			(function (err, val) {
				console.log('22:', val);
				asyncThunk(100, 23)
				(function (err, val) {
					console.log('23:', val);
				});
			});
		});
	}


	// asyncCallback(msec, arg. callback) : node style normal callback
	// callback : function (err, val)
	function asyncCallback(msec, arg, callback) {
		setTimeout(callback, msec, null, arg);
	}
```


### Quick example collection: [aa-readme-example.js](examples/aa-readme-example.js#readme)

```bash
$ node aa-readme-example.js
```


```js
  var aa = require('aa');


	// sleep(msec, args,... callback) : node style normal callback
	// callback : function (err, val)
	function sleep(msec) {
		var args = [].slice.call(arguments, 1);
		setTimeout.apply(null, [args.pop(), msec, null].concat(args));
	}

	sleep(1000, function (err, val) { console.log('1000 msec OK'); });


	// delay(msec, args,...)(callback) : thunk
	// callback : function (err, val)
	function delay(msec) {
		var args = [].slice.call(arguments);
		return function (callback) {
			sleep.apply(null, args.concat(callback));
		};
	}
	// var delay = aa.thunkify(sleep);

	delay(1100)(
		function (err, val) { console.log('1100 msec OK'); }
	);


	// aa.promisify(fn)   : returns wrapped function a.k.a thunkify and promisify
	// wait(msec, args,...) : returns promise & thunk
	var wait = aa.promisify(sleep);

	// wait() : as a thunk
	wait(1200)(
		function (err, val) { console.log('1200 msec OK'); }
	);

	// wait() : as a promise
	wait(1300).then(
		function (val) { console.log('1300 msec OK'); },
		function (err) { console.log('1300 msec NG', err); }
	).catch(
		function (err) { console.log('1300 msec NG2', err); }
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
		var chan = aa.Channel();

		sleep(300, 20, chan);   // send value to channel : fork or spread
		sleep(200, 10, chan);   // send value to channel : fork or spread
		var a = yield chan;     // recv value from channel : join or sync
		var b = yield chan;     // recv value from channel : join or sync
		console.log('10 20:', a, b);


		// fork thread -  make new thread and start
		aa(function *() {
			yield wait(200);      // wait 200 msec
			return 200;
		})(chan);               // send 200 to channel : join or sync

		// fork thread -  make new thread and start
		aa(function *() {
			yield wait(100);      // wait 100 msec
			return 100;
		})(chan);               // send 100 to channel : join or sync

		// fork thread -  make new thread and start
		aa(function *() {
			yield wait(300);      // wait 300
			return 300;
		})(chan);               // send 300 to channel : join or sync

		// join threads - sync threads
		var x = yield chan;     // wait & recv first  value from channel
		var y = yield chan;     // wait & recv second value from channel
		var z = yield chan;     // wait & recv third  value from channel
		console.log('top 3 winners: 100 200 300:', x, y, z);


		// communicate with channels
		var chan1 = aa.Channel(), chan2 = aa.Channel();

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
