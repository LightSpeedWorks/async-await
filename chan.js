// chan.js

(function() {
  'use strict';

  var slice = Array.prototype.slice;

  // Channel(empty)
  // recv: chan(cb)
  // send: chan(err, data)
  // send: chan() or chan(undefined)
  // send: chan(data)
  // chan.end()
  // chan.readable()
  // chan.size
  // chan.empty
  // chan.done()
  // chan.send(val or err)
  // chan.recv(cb)

  function Channel(empty) {
    if (arguments.length > 1)
      throw new Error('Channel: too many arguments');
    channel.$isClosed = false;    // send stream is closed
    channel.$isDone = false;      // receive stream is done
    channel.$recvCallbacks = [];  // receive pending callbacks queue
    channel.$sendValues    = [];  // send pending values

    if (typeof empty === 'undefined')
      channel.empty = new Object();
    else if (typeof empty === 'function')
      channel.empty = new empty();
    else
      channel.empty = empty;

    if (Object.setPrototypeOf)
      Object.setPrototypeOf(channel, Channel.prototype);
    else if (channel.__proto__)
      channel.__proto__ = Channel.prototype;
    else {
      channel.close = $$close;
      channel.done  = $$done;
      channel.send  = $$send;
      channel.recv  = $$recv;

      // for stream
      channel.end      = $$close;
      channel.stream   = $$stream;
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


  Channel.prototype.send = $$send;
  function $$send(val) {
    if (this.$isClosed)
      throw new Error('Cannot send to closed channel');
    else if (this.$recvCallbacks.length > 0)
      callback(this.$recvCallbacks.shift(), val);
    else
      this.$sendValues.push(val);
  } // send

  Channel.prototype.recv = $$recv;
  function $$recv(cb) {
    if (this.done())
      cb(null, this.empty);
    else if (this.$sendValues.length > 0)
      callback(cb, this.$sendValues.shift());
    else
      this.$recvCallbacks.push(cb);
    return;
  } // recv

  Channel.prototype.done = $$done;
  function $$done() {
    if (!this.$isDone && this.$isClosed && this.$sendValues.length === 0) {
      this.$isDone = true;
      // callback each pending callback with the empty value
      var empty = this.empty;
      this.$recvCallbacks.forEach(function(cb) { callback(cb, empty); });
    }

    return this.$isDone;
  } // done

  Channel.prototype.close = $$close;
  Channel.prototype.end = $$close;
  function $$close() {
    this.$isClosed = true;
    return this.done();
  } // close

  Channel.prototype.stream = $$stream;
  function $$stream(stream) {
    var channel = this;
    stream.on('end',      close);
    stream.on('error',    error);
    stream.on('readable', readable);
    return this;

    function close()    { return channel.close(); }
    function error(err) { return channel.send(err); }

    function readable() {
      var buf = this.read();
      if (!buf) return;
      channel.send(buf);
    } // readable

  } // stream

  function callback(cb, val) {
    if (val instanceof Error)
      cb(val);
    else
      cb(null, val);
  } // callback

  if (typeof module === 'object' && module && module.exports)
    module.exports = Channel;

})();
