// tree.js

this.tree = function () {
  'use strict';

  //var aa = require('co');
  var aa = require('../aa');
  var fs = require('fs');
  var path = require('path');
  var $totalsize = '*totalsize*';
  var $error = '*error*';
  var INDENT = '  ';

  var readdir = thunkify.call(fs, fs.readdir);

  var counter = 0;

  //var lastTree = {};
  //var timerCount = 3;
  //var timer = setInterval(function () {
  //  console.log('\x1b[90m' + inspect(lastTree) + '\x1b[m');
  //  if (--timerCount <= 0) clearInterval(timer);
  //}, 1000);

  //*****************************************************
  function *tree(dir, minSize, level) {
    if (!dir) dir = '.';
    dir = path.resolve(dir);
    //console.log(++counter + '\t' + level + '\t' + minSize + '\t' + dir);
    //console.log(new Error().stack);
    if (!level) level = 0;

    try {
      var names = yield readdir(dir);
    } catch (err) {
      console.log('fs.readdir: ' + err);
      children[$error] = err;
      return children; //  null;
    }

    var totalsize = 0;
    var dirsize = 0;
    var children = {};

    names.forEach(function (name) { children[name] = null; });

    try {
      // sync parallel: fs.stat
      var res = yield names.map(function (name) {
        var file = path.resolve(dir, name);
        return {name:name, file:file, stat:fs_stat(file)}
      });
    } catch (err) {
      console.log('fs_stat: ' + err);
      children[$error] = err;
      return children;
    }

    try {
      // sync parallel: tree
      res = yield res.map(function (elem) {
        var name = elem.name;
        var stat = elem.stat;

        if (stat instanceof Error) {
          console.log('stat error: ' + err);
          return {name:name, size:0, child:null};
        }

        var size = stat.size;
        var file = elem.file;

        if (stat.isDirectory())
          var child = tree(file, minSize, level + 1);

        return {name:name, size:size, child:child}
      });
    } catch (err) {
      console.log('tree: ' + err.stack);
      children[$error] = err;
      return children;
    }

    if (!res || !res.map)
      console.log('####', typeof res, res.constructor.name, res);

    // rest of process
    res.map(function (elem) {
      var name = elem.name;
      var size = elem.size;
      var child = elem.child;

      if (child instanceof Error)
        children[name] = size;
      else if (child && typeof child[$totalsize] === 'number') {
        if (child[$totalsize] >= minSize)
          children[name] = child;
        else
          children[name] = child[$totalsize];
        totalsize += child[$totalsize];
      }
      else
        children[name] = size;

      totalsize += size;
      dirsize += size;

      return {name:name, size:size, child:child};
    });

    children[$totalsize] = totalsize;
    //return lastTree = children;
    return children;
  }

  //*****************************************************
  // thunkify(fn)
  function thunkify(fn) {
    var ctx = this;
    return function () {
      var args = [].slice.call(arguments);
      return function (cb) {
        fn.apply(ctx, args.concat(cb));
      };
    };
  } // thunkify

  //*****************************************************
  function fs_stat(file) {
    return function (cb) {
      fs.stat(file, function (err, stat) {
        err && console.log('fs.stat: ' + err);
        if (err) cb(null, err); // !!! error -> data !!!
        else     cb(null, stat);
      });
    }
  } // fs_stat

  //*****************************************************
  function inspect(obj, level, indent) {
    if (!level) level = 0, indent = '';
    switch (typeof obj) {
      case 'object':
        if (obj === null) return 'null';
        var indent2 = indent + INDENT;
        level++;
        if (obj instanceof Array) {
          if (obj.length === 0) return '[]';
          var str =  '[\n' + indent;
          for (var i = 0, n = obj.length; i < n; ++i)
            str += INDENT + inspect(obj[i], level, indent2) + (i < n - 1 ? ',' + '\n' + indent : '');
          return str + ']';
        }
        else {
          var str = '{\n' + indent, i = 0, n = Object.keys(obj).length;
          if (n === 0) return '{}';
          for (var p in obj)
            str += INDENT + p + ': ' + inspect(obj[p], level, indent2) + (++i < n ? ',' + '\n' + indent : '');
          return str + ' }';
        }
      case 'number':
      case 'string':
      case 'boolean':
      case 'null': // ES6?
      case 'undefined':
        return obj + '';
      case 'function': return 'function';
      default:
        throw new TypeError(typeof obj);
    }
  }

  tree.tree = tree;

  // node.js module.exports
  if (typeof module === 'object' && module && module.exports) {
    module.exports = tree;

    // main
    if (require.main === module) {
      var dir = path.resolve(process.argv[2] || '.');
      console.log('main', dir);
      aa(tree(dir, eval(process.argv[3]) || 0, 0))
      .then(
        function (val) {
          console.log('\x1b[36m' + inspect(val) + '\x1b[m');
        },
        function (err) {
          console.log(err.stack);
        }
      ); // then
    }

  }

  return tree;
}();
