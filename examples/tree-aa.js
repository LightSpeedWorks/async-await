// tree-sync.js

this.tree = function () {
  'use strict';

  var fs = require('fs');
  var path = require('path');
  var inspect = require('./my-inspect').inspect;

  var aa = require('../aa');
  //var aa = require('co');
  var fs_stat = aa(fs.stat);
  var fs_readdir = aa(fs.readdir);

  var $totalsize = '*totalsize*';
  var $error = '*error*';
  var $path = '*path*';

  var currentPath = '';

  //*****************************************************
  function *tree(file, minSize, level) {
    if (!file)    file = '.';
    if (!minSize) minSize = 0;
    if (!level)   level = 0;

    currentPath = file;

    var children = {};
    try {
      var stat = yield fs_stat(file);
      if (!stat.isDirectory())
        return stat.size;

      var totalsize = 0;

      var names = yield fs_readdir(file);
      var result = yield names.map(function (name) {
        return tree(path.resolve(file, name), minSize, level + 1);
      });

      result.forEach(function (child, i) {
        var name = names[i];

        if (typeof child === 'number') {
          totalsize += child;
          children[name] = child;
        }
        else {
          var size = child[$totalsize];
          if (Number.isFinite(size)) totalsize += size;
          children[name + '/'] = size < minSize ? size : child;
        }
      }); // result.forEach

      children[$path] = file;
      children[$totalsize] = totalsize;
      return children;
    } catch (err) {
      children[$path] = file;
      children[$error] = err + '';
      return children;
    }
  } // tree


  tree.tree = tree;

  // node.js module.exports
  if (typeof module === 'object' && module && module.exports) {
    module.exports = tree;

    // main
    if (require.main === module) {
      if (!process.argv[2])
        return console.log('usage: iojs %s {path} [min-size]',
          process.argv[1])
      var file = path.resolve(process.argv[2] || '.');
      var minSize = eval(process.argv[3]) || 0;
      console.log('tree main:', file);
      require('control-c')(
        function () {
          console.error(currentPath);
          console.error('time: %d sec', (Date.now() - startTime) / 1000.0);
        },
        function () { process.exit(); });
      var startTime = Date.now();
      aa(function *() {
        var val = yield tree(file, minSize, 0);
        console.log(inspect(val));
        console.log('time: %d sec', (Date.now() - startTime) / 1000.0);
      });
    }

  }

  return tree;
}();
