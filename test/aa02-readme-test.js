	'use strict';

	var aa = require('../aa02');

	var Promise = aa.Promise;

	var assert = require('assert');


	var slice = [].slice;


	function clog() {
		console.log('    \x1b[36m' + slice.call(arguments).join(' ') + '\x1b[m'); }
	function cerr() {
		console.log('    \x1b[35m' + slice.call(arguments).join(' ') + '\x1b[m'); }


	// timed(done, ms, val)
	function timed(done, ms, val) {
		if (arguments.length < 3) val = new Error('time out');
		var timer = setTimeout(function () { finish(val); }, ms);
		function finish(err, val) {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			done && done(err);
			done = null;
		}
		return finish;
	}

	// expectError(done)
	function expectError(done) {
		return function (err, val) {
			if (err instanceof Error) return done();
			done(new Error('unexpected val: ' + val + (err == null ? '' : ' ' + err)));
		};
	}

	// sleep(ms, args,... cb) : node style normal callback
	function sleep(ms) {
		var args = [].slice.call(arguments, 1), cb = args.pop();
		if (ms >= 0)
			setTimeout.apply(null, [cb, ms, null].concat(args));
		else
			setTimeout(cb, 0, new RangeError('sleep ms must be plus'));
	}


	// delay(ms, args,...)(cb) : thunk
	function delay(ms) {
		var args = [].slice.call(arguments);
		return function (cb) {
			sleep.apply(null, args.concat(cb));
		};
	}


	// aa(fn) | aa.wrap(fn) : returns wrapped function a.k.a thunkify and promisefy
	// wait(ms, args,...)   : returns promise & thunk
	var wait = aa.promisify(sleep);


	describe('basic', function () {

		it('sleep 10', function (done) {
			done = timed(done, 30);
			sleep(10, done);
		});

		it('sleep -1', function (done) {
			done = timed(done, 30);
			sleep(-1, expectError(done));
		});

		it('delay 10', function (done) {
			done = timed(done, 30);
			delay(10)(done);
		});

		it('delay -1', function (done) {
			done = timed(done, 30);
			delay(-1)(expectError(done));
		});

		it('wait 10 thunk', function (done) {
			done = timed(done, 30);
			wait(10)(done);
		});

		it('wait -1 thunk', function (done) {
			done = timed(done, 30);
			wait(-1)(expectError(done));
		});

		it('wait 10 promise', function (done) {
			done = timed(done, 30);
			wait(10).then(done, done).catch(done);
		});

		it('wait -1 promise', function (done) {
			done = timed(done, 30);
			done = expectError(done);
			wait(-1).then(done, done).catch(done);
		});

	}); // basic


	describe('aa generator', function () {

		it('yield primitive values, array and object', function (done) {
			done = timed(done, 100);

			// aa(generator) : returns promise & thunk
			aa(function *() {
				var v;

				// primitive value
				v = yield 123;
				assert.equal(v, 123);
				v = yield 'string';
				assert.equal(v, 'string');
				v = yield true;
				assert.equal(v, true);

				// array
				v = yield [1, 2, 3];
				assert.deepEqual(v, [1, 2, 3]);

				// object
				v = yield {x:1, y:2, z:3};
				assert.deepEqual(v, {x:1, y:2, z:3});
			})(done);
		});


		it('yield promises', function (done) {
			done = timed(done, 100);

			// aa(generator) : returns promise & thunk
			aa(function *() {
				var v;

				// wait for promise
				v = yield Promise.resolve(123);
				assert.equal(v, 123);
				try {
					v = yield Promise.reject(new Error('expected'));
					done(new Error('reject must throw'));
				} catch (err) {
					v = 234;
				}
				assert.equal(v, 234);

			})(done);
		});


		it('yield thunks: delay', function (done) {
			done = timed(done, 100);

			// aa(generator) : returns promise & thunk
			aa(function *() {
				var v;

				// wait for thunk
				v = yield delay(2);
				assert.equal(v, undefined);
				v = yield delay(2, 11);
				assert.equal(v, 11);
				try {
					v = yield delay(-1, 12);
					done(new Error('delay -1 must throw'));
				} catch (err) {
					v = 13;
				}
				assert.equal(v, 13);

			})(done);
		});


		it('yield promises and thunks: wait', function (done) {
			done = timed(done, 100);

			// aa(generator) : returns promise & thunk
			aa(function *() {
				var v;

				// wait for promise or thunk
				v = yield wait(2);
				assert.equal(v, undefined);
				v = yield wait(2, 22);
				assert.equal(v, 22);
				try {
					v = yield wait(-1, 23);
					done(new Error('wait -1 must throw'));
				} catch (err) {
					v = 24;
				}
				assert.equal(v, 24);
			})(done);
		});

		it('yield Promise.all []', function (done) {
			done = timed(done, 100);

			// aa(generator) : returns promise & thunk
			aa(function *() {
				// yield Promise.all([])
				var v = yield Promise.all([wait(20, 1), wait(30, 2), wait(10, 3)]);
				assert.deepEqual(v, [1, 2, 3]);
			})(done);
		});

		it('yield []', function (done) {
			done = timed(done, 100);

			// aa(generator) : returns promise & thunk
			aa(function *() {
				// yield [] -> like Promise.all([]) !
				var v = yield [wait(20, 4), wait(30, 5), wait(10, 6)];
				assert.deepEqual(v, [4, 5, 6]);
			})(done);
		});

		it('yield {}', function (done) {
			done = timed(done, 100);

			// aa(generator) : returns promise & thunk
			aa(function *() {
				// yield {} -> like Promise.all({}) !?
				var v = yield {x:wait(20, 7), y:wait(30, 8), z:wait(10, 9)};
				assert.deepEqual(v, {x:7, y:8, z:9});
			})(done);
		});

		it('chan: sleep and yield', function (done) {
			done = timed(done, 100);

			// aa(generator) : returns promise & thunk
			aa(function *() {
				// make channel for sync - fork and join
				var chan = aa(); // or aa.chan()

				sleep(30, 20, chan);   // send value to channel
				sleep(20, 10, chan);   // send value to channel
				var a = yield chan;     // recv value from channel
				var b = yield chan;     // recv value from channel
				assert.equal(a, 10);
				assert.equal(b, 20);
			})(done);
		});

		it('chan: fork and join', function (done) {
			done = timed(done, 100);

			// aa(generator) : returns promise & thunk
			aa(function *() {
				// make channel for sync - fork and join
				var chan = aa(); // or aa.chan()

				// fork thread -  make new thread and start
				aa(function *() {
					yield wait(20);
					return 20;
				})(chan);
 
				// fork thread -  make new thread and start
				aa(function *() {
					yield wait(10);
					return 10;
				})(chan);
 
				// fork thread -  make new thread and start
				aa(function *() {
					yield wait(30);
					return 30;
				})(chan);

				// join threads - sync threads
				var x = yield chan;
				var y = yield chan;
				var z = yield chan;
				assert.equal(x, 10);
				assert.equal(y, 20);
				assert.equal(z, 30);
			})(done);
		});


		it('chan: communication', function (done) {
			done = timed(done, 200);

			// aa(generator) : returns promise & thunk
			aa(function *() {
				// communicate with channels
				var chan = aa(), chan1 = aa(), chan2 = aa();
 
				// thread 1: send to chan1, recv from chan2
				aa(function *() {
					sleep(2, 111, chan1);
					assert.equal(yield chan2, 222);
					sleep(2, 333, chan1);
					assert.equal(yield chan2, 444);
					sleep(2, 555, chan1);
					return 666;
				})(chan);
 
				// thread 1: recv from chan1, send to chan2
				aa(function *() {
					assert.equal(yield chan1, 111);
					sleep(2, 222, chan2);
					assert.equal(yield chan1, 333);
					sleep(2, 444, chan2);
					assert.equal(yield chan1, 555);
					return 777;
				})(chan);

				assert.equal(yield chan, 666);
				assert.equal(yield chan, 777);
			})(done);
		});


		it('promise or thunk chain', function (done) {
			done = timed(done, 100);

			// aa(generator) : returns promise & thunk
			aa(function *() {
				return 11;
			})
			.then(
				function (val) {
					//clog(11);
					assert.equal(val, 11);
					return wait(10, 22); },
				function (err) {
					cerr('11 err:', err);
					done(err); }
			)
			(function (err, val) {
					//clog(22);
					err && cerr('22 err: ', err);
					assert.equal(val, 22);
					return wait(10, 33); })
			(function (err, val) {
					//clog(33);
					err && cerr('33 err: ', err);
					assert.equal(val, 33);
					return wait(10, 44); })
			.then(
				function (val) {
					//clog(44);
					assert.equal(val, 44);
					return wait(10, 55);
					},
				function (err) {
					cerr('44 err:', err);
					done(err); }
			)(done);

		});

	}); // aa generator



