// tree.js

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
  function tree(file, minSize, level) {
    if (!file)    file = '.';
    if (!minSize) minSize = 0;
    if (!level)   level = 0;

    var stat = fs.statSync(file);

    if (!stat.isDirectory())
      return stat.size;

    var children = {};
    var totalsize = 0;
    var names = fs.readdirSync(file);
    names.forEach(function (name) {
      var child = tree(path.resolve(file, name), minSize, level + 1);
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
    });
    children[$path] = file;
    children[$totalsize] = totalsize;
    return children;
  } // tree


  tree.tree = tree;

  // node.js module.exports
  if (typeof module === 'object' && module && module.exports) {
    module.exports = tree;

    // main
    if (require.main === module) {
      var file = path.resolve(process.argv[2] || '.');
      console.log('tree main:', file);
      var val = tree(file, eval(process.argv[3]) || 0);
      console.log(inspect(val));
    }

  }

  return tree;
}();
