// aa.js - async-await.js

this.aa = function (PromiseThunk) {
	'use strict';

	var isPromise = PromiseThunk.isPromise;
	var promisify = PromiseThunk.promisify;

	// GeneratorFunction
	try {
		var GeneratorFunction = Function('return function*(){}.constructor')();
	} catch (e) {}

	// GeneratorFunctionPrototype
	try {
		var GeneratorFunctionPrototype = Function('return (function*(){})().constructor')();
	} catch (e) {}

	var slice = [].slice;

	// defProp
	var defProp = function (obj) {
		if (!Object.defineProperty) return null;
		try {
			Object.defineProperty(obj, 'prop', {value: 'str'});
			return obj.prop === 'str' ? Object.defineProperty : null;
		} catch (err) { return null; }
	} ({});

	// setConst(obj, prop, val)
	var setConst = defProp ?
		function setConst(obj, prop, val) {
			defProp(obj, prop, {value: val}); } :
		function setConst(obj, prop, val) { obj[prop] = val; };

	// setValue(obj, prop, val)
	var setValue = defProp ?
		function setValue(obj, prop, val) {
			defProp(obj, prop, {value: val,
				writable: true, configurable: true}); } :
		function setValue(obj, prop, val) { obj[prop] = val; };

	// setProto(obj, proto)
	var setProto = Object.setPrototypeOf || {}.__proto__ ?
		function setProto(obj, proto) { obj.__proto__ = proto; } : null;


	// Queue
	function Queue() {
		this.tail = this.head = null;
	}
	Queue.prototype.push = function push(x) {
		if (this.tail)
			this.tail = this.tail[1] = [x, null];
		else
			this.tail = this.head = [x, null];
	};
	Queue.prototype.shift = function shift() {
		if (!this.head) return null;
		var x = this.head[0];
		this.head = this.head[1];
		if (!this.head) this.tail = null;
		return x;
	};


	// nextTickDo(fn)
	var nextTickDo = typeof setImmediate === 'function' ? setImmediate :
		typeof process === 'object' && process && typeof process.nextTick === 'function' ? process.nextTick :
		function nextTick(fn) { setTimeout(fn, 0); };

	var tasks = new Queue();

	var nextTickProgress = false;

	// nextTick(fn, ...args)
	function nextTick(fn) {
		if (typeof fn !== 'function')
			throw new TypeError('fn must be a function');

		tasks.push(arguments);
		if (nextTickProgress) return;

		nextTickProgress = true;

		nextTickDo(function () {
			var args;
			while (args = tasks.shift())
				args[0](args[1], args[2], args[3], args[4]);

			nextTickProgress = false;
		});
	}


	// aa - async-await
	function aa(gtor) {
		var ctx = this, args = slice.call(arguments, 1);

		// is generator function? then get generator.
		if (isGeneratorFunction(gtor))
			gtor = gtor.apply(ctx, args);

		// is promise? then do it.
		if (isPromise(gtor))
			return PromiseThunk.resolve(gtor);

		// is function? then promisify it.
		if (typeof gtor === 'function')
			return promisify.call(ctx, gtor);

		// is not generator?
		if (!isGenerator(gtor))
			return Channel.apply(ctx, arguments);

		var resolve, reject, p = new PromiseThunk(
			function (res, rej) { resolve = res; reject = rej; });

		nextTick(callback);
		return p;

		function callback(err, val) {
			try {
				if (err) {
					if (typeof gtor['throw'] !== 'function')
						return reject(err);
					var ret = gtor['throw'](err);
				}
				else
					var ret = gtor.next(val);
			} catch (err) {
				return reject(err);
			}

			if (ret.done)
				return resolve(ret.value);

			nextTick(doValue, ret.value, callback, ctx, args);
		}

	}


	function doValue(value, callback, ctx, args) {
		if (value == null ||
				 typeof value !== 'object' &&
				 typeof value !== 'function')
			return callback(null, value);

		if (isGeneratorFunction(value))
			value = value.apply(ctx, args);

		if (isGenerator(value))
			return aa.call(ctx, value)(callback);

		// function must be a thunk
		if (typeof value === 'function')
			return value(callback);

		if (isPromise(value))
			return value.then(function (val) { callback(null, val); }, callback);

		var called = false;

		// array
		if (value instanceof Array) {
			var n = value.length;
			if (n === 0) return callback(null, []);
			var arr = Array(n);
			value.forEach(function (val, i) {
				doValue(val, function (err, val) {
					if (err) {
						if (!called)
							called = true, callback(err);
					}
					else {
						arr[i] = val;
						if (--n === 0 && !called)
							called = true, callback(null, arr);
					}
				});
			});
		} // array

		// object
		else if (value.constructor === Object) {
			var keys = Object.keys(value);
			var n = keys.length;
			if (n === 0) return callback(null, {});
			var obj = {};
			keys.forEach(function (key) {
				obj[key] = undefined;
				doValue(value[key], function (err, val) {
					if (err) {
						if (!called)
							called = true, callback(err);
					}
					else {
						obj[key] = val;
						if (--n === 0 && !called)
							called = true, callback(null, obj);
					}
				});
			});
		} // object

		// other value
		else
			return callback(null, value);
	}


	// isGeneratorFunction
	function isGeneratorFunction(gtor) {
		if (!gtor) return false;
		var ctor = gtor.constructor;
		return ctor === GeneratorFunction ||
			(ctor.displayName || ctor.name) === 'GeneratorFunction';
	}

	// isGenerator
	function isGenerator(gtor) {
		if (!gtor) return false;
		var ctor = gtor.constructor;
		return ctor === GeneratorFunctionPrototype ||
			(ctor.displayName || ctor.name) === 'GeneratorFunctionPrototype' ||
			typeof gtor.next === 'function';
	}


	// Channel(empty)
	// recv: chan(cb)
	// send: chan(err, data)
	// send: chan() or chan(undefined)
	// send: chan(data)
	// chan.end()
	// chan.empty
	// chan.done()
	// chan.send(val or err)
	// chan.recv(cb)

	if (setProto)
		setProto(Channel.prototype, Function.prototype);
	else {
		Channel.prototype = Function();
		Channel.prototype.constructor = Channel;
	}


	// Channel(empty)
	function Channel(empty) {
		if (arguments.length > 1)
			throw new Error('Channel: too many arguments');

		channel.$isClosed = false;    // send stream is closed
		channel.$isDone = false;      // receive stream is done
		channel.$recvCallbacks = [];  // receive pending callbacks queue
		channel.$sendValues    = [];  // send pending values

		channel.empty = typeof empty === 'function' ? new empty() : empty;

		if (setProto)
			setProto(channel, Channel.prototype);
		else {
			channel.close = $$close;
			channel.done  = $$done;
			channel.send  = $$send;
			channel.recv  = $$recv;

			// for stream
			channel.end      = $$close;
			channel.stream   = $$stream;

			if (channel.call !== Function.prototype.call)
				channel.call = Function.prototype.call;

			if (channel.apply !== Function.prototype.apply)
				channel.apply = Function.prototype.apply;
		}

		return channel;

		function channel(a, b) {
			// yield callback
			if (typeof a === 'function')
				return channel.recv(a);

			// error
			if (a instanceof Error)
				return channel.send(a);

			// value or undefined
			if (arguments.length <= 1)
				return channel.send(a);

			var args = slice.call(arguments);

			if (a == null) {
				if (arguments.length === 2)
					return channel.send(b);
				else
					args.shift();
			}

			// (null, value,...) -> [value, ...]
			return channel.send(args);
		}

	} // Channel

	// send(val or err)
	var $$send = Channel.prototype.send = send;
	function send(val) {
		if (this.$isClosed)
			throw new Error('Cannot send to closed channel');
		else if (this.$recvCallbacks.length > 0)
			complete(this.$recvCallbacks.shift(), val);
		else
			this.$sendValues.push(val);
	} // send

	// recv(cb)
	var $$recv = Channel.prototype.recv = recv;
	function recv(cb) {
		if (this.done())
			cb(null, this.empty);
		else if (this.$sendValues.length > 0)
			complete(cb, this.$sendValues.shift());
		else
			this.$recvCallbacks.push(cb);
		return;
	} // recv

	// done()
	var $$done = Channel.prototype.done = done;
	function done() {
		if (!this.$isDone && this.$isClosed && this.$sendValues.length === 0) {
			this.$isDone = true;
			// complete each pending callback with the empty value
			var empty = this.empty;
			this.$recvCallbacks.forEach(function(cb) { complete(cb, empty); });
		}

		return this.$isDone;
	} // done

	// close() end()
	var $$close = Channel.prototype.close = Channel.prototype.end = close;
	function close() {
		this.$isClosed = true;
		return this.done();
	} // close

	// stream(reader)
	var $$stream = Channel.prototype.stream = stream;
	function stream(reader) {
		var channel = this;
		reader.on('end',      close);
		reader.on('error',    error);
		reader.on('readable', readable);
		return this;

		function close()    { return channel.close(); }
		function error(err) { try { channel.send(err); } catch (e) {} }

		function readable() {
			var buf = this.read();
			if (!buf) return;
			try { channel.send(buf); } catch (e) {}
		} // readable
	} // stream

	// complete(cb, val or err)
	function complete(cb, val) {
		if (val instanceof Error)
			cb(val);
		else
			cb(null, val);
	} // complete


	function wait(ms) {
		return function (cb) {
			setTimeout(cb, ms);
		};
	};


	if (typeof module === 'object' && module && module.exports)
		module.exports = aa;

	if (GeneratorFunction)
		aa.GeneratorFunction = GeneratorFunction;

	aa.isGeneratorFunction = isGeneratorFunction;
	aa.isGenerator         = isGenerator;
	aa.aa                  = aa;
	aa.chan = aa.Channel   = Channel;
	aa.wait                = wait;

	if (Object.getOwnPropertyNames)
		Object.getOwnPropertyNames(PromiseThunk).forEach(function (prop) {
			if (!aa.hasOwnProperty(prop))
				setValue(aa, prop, PromiseThunk[prop]);
		});
	else
		for (var prop in PromiseThunk)
			if (!aa.hasOwnProperty(prop))
				setValue(aa, prop, PromiseThunk[prop]);

	return aa;

}(this.PromiseThunk || require('promise-thunk'));
