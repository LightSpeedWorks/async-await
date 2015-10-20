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


	// asyncCallback(ms, arg. cb) : node style normal callback
	// cb : function (err, val)
	function asyncCallback(ms, arg, cb) {
		setTimeout(function () { cb(null, arg); }, ms);
	}
