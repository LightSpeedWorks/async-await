// tree.js

this.tree = function () {
	'use strict';

	//var aa = require('co');
	var aa = require('../aa');
	var fs = require('fs');
	var path = require('path');
	var $totalsize = '*totalsize*';
	var $error = '*error*';
	var $path = '*path*';
	var INDENT = '  ';

	var readdir = thunkify(fs.readdir);

	var counter = 0;

	//*****************************************************
	function *tree(dir, minSize, level) {
		if (!dir) dir = '.';
		if (!level) level = 0;

		var children = {};
		var totalsize = 0;

		try {
			var procName = 'tree: fs.readdir: ';
			var names = yield readdir(dir);

			var res = names.map(function (name) {
				var file = path.resolve(dir, name);
				return {name:name, file:file, stat:fs_stat(file)};
			});

			// sync parallel: fs.stat
			procName = 'tree: fs_stat: ';
			res = yield res;

			procName = 'tree: check fs.stat: ';
			res.forEach(function (elem) {
				elem.size = 0;
				elem.child = null;

				if (elem.stat instanceof Error) {
					console.log('tree: fs.stat error: ' + elem.stat);
					return;
				}

				elem.size = elem.stat.size;

				if (elem.stat.isDirectory()) {
					elem.name += '/';
					elem.child = tree(elem.file, minSize, level + 1);
				}

				children[elem.name] = null;
			});

			// sync parallel: tree
			procName = 'tree: tree() ';
			res = yield res;

			// rest of process
			procName = 'tree: after tree() ';
			res.forEach(function (elem) {
				var name = elem.name;
				var size = elem.size;
				var child = elem.child;

				if (child && Number.isFinite(child[$totalsize])) {
					if (child[$totalsize] >= minSize)
						children[name] = child;
					else
						children[name] = child[$totalsize];
					totalsize += child[$totalsize];
				}
				else
					children[name] = size;

				totalsize += size;
			});

			children[$totalsize] = totalsize;

		} catch (err) {
			console.log(procName + err);
			children[$error] = procName + err;
		}

		children[$path] = dir;
		return children;
	}

	//*****************************************************
	// thunkify(fn)
	function thunkify(fn) {
		return function () {
			var args = [].slice.call(arguments);
			return function (cb) {
				fn.apply(null, args.concat(cb));
			};
		};
	} // thunkify

	//*****************************************************
	function fs_stat(file) {
		return function (cb) {
			fs.stat(file, function (err, stat) {
				if (err) cb(null, err); // !!! error -> data !!!
				else     cb(null, stat);
			});
		};
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
			console.log('tree main:', dir);
			aa(tree(dir, eval(process.argv[3]) || 0, 0))
			.then(
				function (val) {
					console.log(inspect(val));
				},
				function (err) {
					console.log(err.stack);
				}
			); // then
		}

	}

	return tree;
}();
