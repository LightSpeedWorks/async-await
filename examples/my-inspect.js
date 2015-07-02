this.inspect = function () {
  'use strict';

  var INDENT = '  ';

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

  return inspect;
}();
