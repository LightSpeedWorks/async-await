// chan.js

(function() {
'use strict';

function makeChan(options) {
  var chan = new Channel(fn, options);

  function fn(a, b) {
    // yield callback
    if (typeof a === 'function') {
      return chan.recv(a);
    }

    // (err, val)
    if (a === null || typeof b !== 'undefined') {
      a = b;
    }

    // value
    chan.send(a);
  }

  fn.empty = chan.empty;
  fn.close = chan.close.bind(chan);
  fn.done  = chan.done.bind(chan);
  fn.send  = chan.send.bind(chan);
  fn.recv  = chan.recv.bind(chan);

  return fn;
}

// recv: chan(cb)
// send: chan(err, data)
// send: chan() or chan(undefined)
// send: chan(data)

function Channel(fn, options) {
  if (typeof options === 'undefined') options = {};

  var chan = this;
  fn._chan = chan;
  chan.fn = fn;

  var isClosed;        // send stream is closed
  var isDone;          // receive stream is done
  var callbacks = [];  // receive pending callbacks queue
  var values    = [];  // send pending values

  var empty = chan.empty = options.empty || new Object();

  var send = chan.send = function send(val) {
    if (isClosed) {
      throw new Error('Cannot send to closed channel');
    } else if (callbacks.length > 0) {
      call(callbacks.shift(), val);
    } else {
      values.push(val);
    }
  }; // send

  var recv = chan.recv = function recv(cb) {
    if (done()) {
      call(cb, empty);
    } else if (values.length > 0) {
      call(cb, values.shift());
    } else {
      callbacks.push(cb);
    }
    return;
  }; // recv

  var done = chan.done = function done() {
    if (!isDone && isClosed && values.length === 0) {
      isDone = true;
      // call each pending callback with the empty value
      callbacks.forEach(function(cb) { call(cb, empty); });
    }

    return isDone;
  }; // done

  var close = chan.close = function close() {
    isClosed = true;
    return done();
  }; // close

  function call(cb, val) {
    if (val instanceof Error) {
      cb(val);
    } else {
      cb(null, val);
    }
  } // call

} // Channel

exports = module.exports = makeChan;

})();
