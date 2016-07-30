	'use strict';

	const aa = require('../aa');
	const aa02 = require('../aa02');
	const util = require('util');

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
		return function delayThunk(cb) {
			sleep.apply(null, args.concat(cb));
		};
	}


	// aa(fn) | aa.wrap(fn) : returns wrapped function a.k.a thunkify and promisefy
	// wait(ms, args,...)   : returns promise & thunk
	var wait = aa.promisify(sleep);

	function *main(chan) {
		console.log(util.inspect(
			yield wait(20, 4),
			{colors:true, depth:null}));
		console.log(util.inspect(
			yield delay(20, 4),
			{colors:true, depth:null}));

		// yield [] -> like Promise.all([]) !
		console.log(util.inspect(
			yield [wait(20, 4), wait(30, 5), wait(10, 6)],
			{colors:true, depth:null}));

		console.log(util.inspect(
			yield [delay(20, 4), delay(30, 5), delay(10, 6)],
			{colors:true, depth:null}));

		console.log(util.inspect(
			yield {x:wait(20, 4), y:wait(30, 5), z:wait(10, 6)},
			{colors:true, depth:null}));

		console.log(util.inspect(
			yield {x:delay(20, 4), y:delay(30, 5), z:delay(10, 6)},
			{colors:true, depth:null}));

		console.log(yield wait(20, 4)((err, val) => wait(30, 5))((err, val) => wait(10, 6)));

		const ch = chan();
		setTimeout(ch, 200, 'ok2');
		setTimeout(ch, 100, 'ok1');
		console.log('ch start');
		console.log('ch wait', yield ch, yield ch);
		setTimeout(ch, 200, 'ok2');
		setTimeout(ch, 100, 'ok1');
		console.log('ch wait', yield [ch, ch]);
	}

	aa(main(aa.chan))
	.then(() => console.log('----'))
	.then(() => aa02(main(aa.chan)));
