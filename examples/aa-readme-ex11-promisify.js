	try {
		var aa = require('../aa');
	} catch (e) {
		var aa = require('aa');
	}


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
