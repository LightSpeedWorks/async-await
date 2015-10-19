// npm-piblish

(function () {
	'use strict';

	var aa = require('../aa'), promisify = aa.promisify;
	var fs = require('fs');
	var path = require('path');
	var fs_readFile = promisify(fs.readFile);
	var fs_writeFile = promisify(fs.writeFile);
	var child_process_exec = promisify(require('child_process').exec);

	aa(function *() {
		var pkgFile = path.resolve(__dirname, '../package.json');
		console.log(pkgFile);
		var pkg = JSON.parse(yield fs_readFile(pkgFile, {encoding: 'utf8'}));
		pkg.name = 'async-await';
		console.log(pkg.name);
		console.log(JSON.stringify(pkg, null, '  '));
		yield fs_writeFile(pkgFile, JSON.stringify(pkg, null, '  '), {encoding: 'utf8'});
		var res1 = yield child_process_exec('a');
		console.log(res1[0]);
		res1[1] && console.log(res1[1]);
		pkg.name = 'aa';
		console.log(pkg.name);
		console.log(JSON.stringify(pkg, null, '  '));
		yield fs_writeFile(pkgFile, JSON.stringify(pkg, null, '  '), {encoding: 'utf8'});
		var res2 = yield child_process_exec('a');
		console.log(res2[0]);
		res2[1] && console.log(res2[1]);
	});
})();
