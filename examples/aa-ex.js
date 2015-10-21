// aa-ex.js

(function main() {

	var aa = require('../aa');
	var PromiseThunk = require('promise-thunk');
	var TIME = 300;
	var LONG_TIME = 500;

	// thunk
	function sleep1(ms) {
		return function (cb) {
			if (ms < 0) cb(new RangeError('msec must be plus number'));
			else setTimeout(function () { cb(); }, ms);
		};
	}

	// native Promise
	function sleep2(ms) {
		return new Promise(function (res, rej) {
			if (ms < 0) rej(new RangeError('msec must be plus number'));
			else setTimeout(res, ms);
		});
	}

	// PromiseThunk
	function sleep3(ms) {
		return PromiseThunk(function (res, rej) {
			if (ms < 0) rej(new RangeError('msec must be plus number'));
			else setTimeout(res, ms);
		});
	}

	function makeLast(msg) {
		return function (err, val) {
			if (err)
				console.log(msg, ': \x1b[41merr:', err + '\x1b[m');
			else
				console.log(msg, ': \x1b[42mval:', val + '\x1b[m');
		};
	}

	aa(function *aaMain() {

		console.log();
		console.log('*** yield 10, 20, and return 30');
		yield aa(function *(){ yield 10; yield 20; return 30; })
		(makeLast('  gf'));

		console.log();
		console.log('*** yield 11, 22, and return 33');
		yield aa(function *(){ yield 11; yield 22; return 33; }())
		(makeLast('  gt'));

		console.log();
		console.log('*** yield 52, 51, and return 50');
		yield aa({i: 53, next: function (){ return {value: --this.i, done: this.i <= 50}; }})
		(makeLast('  {}'));

		console.log();
		console.log('*** sleep thunk version');
		yield aa(function *() {
			console.log('111x');
			yield sleep1(TIME);
			console.log('222x');
			yield sleep1(TIME);
			console.log('333x');
			try {
				yield sleep1(-1);
			} catch (e) { makeLast('888x')(e); }
			console.log('444x');
			yield sleep1(-1);
			console.log('555x');
			return '999x';
		})
		(makeLast('   x'));

		console.log();
		console.log('*** sleep native Promise version');
		yield aa(function *() {
			console.log('111p');
			yield sleep2(TIME);
			console.log('222p');
			yield sleep2(TIME);
			console.log('333p');
			try {
				yield sleep2(-1);
			} catch (e) { makeLast('888p')(e); }
			console.log('444p');
			yield sleep2(-1);
			console.log('555p');
			return '999p';
		})
		(makeLast('   p'));

		console.log();
		console.log('*** sleep PromiseThunk version');
		yield aa(function *() {
			console.log('111z');
			yield sleep3(TIME);
			console.log('222z');
			yield sleep3(TIME);
			console.log('333z');
			try {
				yield sleep3(-1);
			} catch (e) { makeLast('888z')(e); }
			console.log('444z');
			yield sleep3(-1);
			console.log('555z');
			return '999z';
		})
		(makeLast('   z'));

		console.log();
		console.log('*** conext object this and arguments');
		yield aa.call({x:1,y:2}, function *(a, b, c) {
			console.log('', this, [].slice.call(arguments));
		}, 11, 22, 33)
		(function (e, v) { console.log('xxx'); return sleep1(LONG_TIME); })
		(function (e, v) { console.log('xxx'); return sleep2(LONG_TIME); })
		(function (e, v) { console.log('xxx'); return sleep3(LONG_TIME); });

		console.log();
		console.log('*** conext object this and arguments');
		yield aa.call({x:1,y:2}, function *(a, b, c) {
			console.log('', this, [].slice.call(arguments));
		}, 11, 22, 33)
		(function (e, v) { console.log('xxx'); return sleep1(LONG_TIME); })
		(function (e, v) { console.log('xxx'); return sleep2(LONG_TIME); })
		(function (e, v) { console.log('xxx'); return sleep3(LONG_TIME); });

	});

})();
