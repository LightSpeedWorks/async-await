	try {
		var aa = require('../aa');
	} catch (e) {
		var aa = require('aa');
	}


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
