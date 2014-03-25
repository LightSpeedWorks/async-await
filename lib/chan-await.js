// chan.js

(function() {
'use strict';

var slice = Array.prototype.slice;

function makeChan(empty, size) {
  if (arguments.length > 2)
    throw new Error('makeChan: too many arguments');

  function fn(a, b) {
    // yield callback
    if (typeof a === 'function') {
      return fn.recv(a);
    }

    if (a instanceof Error) {
      // error
      return fn.send(a);
    }

    if (arguments.length <= 1) {
      // value or undefined
      return fn.send(a);
    }

    var args = slice.call(arguments);

    if (a === null || a === undefined) {
      if (arguments.length === 2) {
        return fn.send(b);
      }
      else {
        args.shift();
      }
    }

    // (null, value,...) -> [value, ...]
    return fn.send(args);
  }

  return new Channel(fn, empty, size), fn;
}

// recv: chan(cb)
// send: chan(err, data)(cb)
// send: chan() or chan(undefined)(cb)
// send: chan(data)(cb)
// chan.end()
// chan.readable(readable)
// chan.size
// chan.empty
// chan.done()
// chan.send(val or err)(cb)
// chan.recv(cb)

function Channel(fn, empty, size) {
  var isClosed = false;    // send stream is closed
  var isDone = false;      // receive stream is done
  var recvCallbacks = [];  // receive pending callbacks queue
  var sendCallbacks = [];  // send pending callbacks and values queue
  var buffCallbacks = [];  // send pending callbacks and values buffer

  if (typeof empty === 'number' && typeof size === 'undefined') {
    size = empty;
    empty = undefined;
  }

  if (typeof empty === 'undefined') {
    empty = new Object();
  } else if (typeof empty === 'function') {
    empty = new empty();
  }

  if (typeof size === 'undefined') {
    size = 0;
  }

  // enqueue into buffer
  var enq = function enq(bomb) {
    if (buffCallbacks.length < size) {
      buffCallbacks.push(bomb);
      bomb.sent = true;
    }
    else {
      sendCallbacks.push(bomb);
    }
  }

  // dequeue from buffer or pendings
  var deq = function deq() {
    var bomb = null;
    if (buffCallbacks.length > 0) {
      bomb = buffCallbacks.shift();
      if (sendCallbacks.length > 0) {
        enq(sendCallbacks.shift());
      }
    }
    else if (sendCallbacks.length > 0) {
      bomb = sendCallbacks.shift();
    }
    return bomb;
  }

  var send = function send(val) {
    if (isClosed) {
      throw new Error('Cannot send to closed channel');
    }

    var bomb = {cb:null, val:val, called:false, sent:false};
    function fn(cb) {
      if (!bomb.cb) {
        if (!cb) cb = function dummyCallback(){};
        bomb.cb = cb;
      }

      if (bomb.sent) {
        fire(bomb);
      }
    }

    enq(bomb);
    if (recvCallbacks.length > 0) {
      bomb = deq();
      call(recvCallbacks.shift(), bomb.val);
      fire(bomb);
    }
    return fn;
  }; // send

  var recv = function recv(cb) {
    if (done()) {
      return call(cb, empty);
    }

    var bomb = deq();
    if (bomb) {
      call(cb, bomb.val);
      fire(bomb);
    } else {
      recvCallbacks.push(cb);
    }
    return;
  }; // recv

  var done = function done() {
    if (!isDone && isClosed &&
        buffCallbacks.length === 0 &&
        sendCallbacks.length === 0) {
      isDone = true;
      // call each pending callback with the empty value
      recvCallbacks.forEach(function(cb) { call(cb, empty); });
    }

    return isDone;
  }; // done

  var end = function end() {
    isClosed = true;
    return done();
  }; // end

  var readable = function readable(readable) {
    return function () {
      var buf = readable.read();
      if (!buf) return;
      send(buf);
    };
  }; // readable

  fn.size  = size;
  fn.empty = empty;
  fn.end   = end;
  fn.done  = done;
  fn.send  = send;
  fn.recv  = recv;

  // for stream
  fn.readable = readable;

} // Channel

function call(cb, val) {
  if (val instanceof Error) {
    cb(val);
  } else {
    cb(null, val);
  }
} // call

function fire(bomb) {
  bomb.sent = true;
  if (!bomb.cb || bomb.called) return;
  bomb.called = true;
  bomb.cb(null, bomb.val);
} // fire

exports = module.exports = makeChan;

})();
