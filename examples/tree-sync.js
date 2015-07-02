// tree.js

this.tree = function () {
  'use strict';

  var fs = require('fs');
  var path = require('path');
  var $totalsize = '*totalsize*';
  var $error = '*error*';
  var $path = '*path*';
  var INDENT = '  ';

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
      var file = path.resolve(process.argv[2] || '.');
      console.log('tree main:', file);
      var val = tree(file, eval(process.argv[3]) || 0);
      console.log(inspect(val));
    }

  }

  return tree;
}();
