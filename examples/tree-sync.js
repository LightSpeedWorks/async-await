// tree-sync.js

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

		var children = {};
		try {
			var stat = fs.statSync(file);
			if (!stat.isDirectory())
				return stat.size;

			var totalsize = 0;

			var names = fs.readdirSync(file);
			names.forEach(function (name) {
				var child = tree(path.resolve(file, name), minSize, level + 1);
				if (typeof child === 'number') {
					totalsize += child;
					children[name] = child;
				}
				else {
					var size = child[$totalsize];
					if (Number.isFinite(size)) totalsize += size;
					children[name + '/'] = size < minSize ? size : child;
				}
			}); // names.forEach

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
			var startTime = Date.now();
			var val = tree(file, minSize, 0);
			console.log(inspect(val));
			console.log('time: %d sec', (Date.now() - startTime) / 1000.0);
		}

	}

	return tree;
}();
