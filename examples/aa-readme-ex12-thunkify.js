	try {
		var aa = require('../aa');
	} catch (e) {
		var aa = require('aa');
	}


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
