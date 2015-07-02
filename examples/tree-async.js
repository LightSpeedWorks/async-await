// tree-async.js

this.tree = function () {
  'use strict';

  var fs = require('fs');
  var path = require('path');
  var inspect = require('./my-inspect').inspect;

  var $totalsize = '*totalsize*';
  var $error = '*error*';
  var $path = '*path*';

  var counter = 0;

  //*****************************************************
  function tree(file, minSize, level, cb) {
    if (!file)    file = '.';
    if (!minSize) minSize = 0;
    if (!level)   level = 0;

    if (typeof cb !== 'function')
      throw new TypeError('tree callback ' + cb + ' must be a function');

    var stat = fs.stat(file, function (err, stat) {
      if (err)
        return cb(err);

      if (!stat.isDirectory())
        return cb(null, stat.size);

      var children = {};
      var totalsize = 0;
      var names = fs.readdirSync(file);

      var n = names.length;
      if (n === 0) return last();

      names.forEach(function (name) {
        tree(path.resolve(file, name), minSize, level + 1, function (err, child) {
          if (err) return cb(err);

          switch (typeof child) {
            case 'number':
              totalsize += child;
              children[name] = child;
              break;
            case 'object':
              var size = child[$totalsize];
              if (Number.isFinite(size)) {
                totalsize += size;
                if (size < minSize)
                  children[name + '/'] = size;
                else
                  children[name + '/'] = child;
              }
              break;
          }
          if (--n === 0) last();

        }); // tree

      }); // names.forEach

      function last() {
        children[$path] = file;
        children[$totalsize] = totalsize;
        return cb(null, children);
      }

    }); // fs.stat

  } // tree


  tree.tree = tree;

  // node.js module.exports
  if (typeof module === 'object' && module && module.exports) {
    module.exports = tree;

    // main
    if (require.main === module) {
      var file = path.resolve(process.argv[2] || '.');
      var minSize = eval(process.argv[3]) || 0;
      console.log('tree main:', file);
      var val = tree(file, minSize, 0, function (err, val) {
        if (err) console.log(err);
        else console.log(inspect(val));
      });
    }

  }

  return tree;
}();
