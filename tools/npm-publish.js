// npm-piblish

(function () {
	'use strict';

	var aa = require('../aa'), promisify = aa.promisify;
	var fs = require('fs');

	var fs_readFile = promisify(fs.readFile);
	var fs_writeFile = promisify(fs.writeFile);
	var child_process_exec = promisify(require('child_process').exec);

	aa(function *() {
		var pkgFile = '../package.json';
		var releaseFile = 'release.json';

		var obj = yield {
			pkg: readJSON(pkgFile),
			release: readJSON(releaseFile, {version: ''})
		};
		var pkg = obj.pkg, release = obj.release;

		if (pkg.version === release.version)
			return console.log('version', release.version, 'is already released');

		release.version = pkg.version;
		yield writeJSON(releaseFile, release)

		pkg.name = 'async-await';
		console.log(pkg.name, pkg.version);
		yield writeJSON(pkgFile, pkg);
		yield execCommand('cd .. & npm publish');

		pkg.name = 'aa';
		console.log(pkg.name, pkg.version);
		yield writeJSON(pkgFile, pkg);
		yield execCommand('cd .. & npm publish');
	});

	// execCommand
	function *execCommand(cmd) {
		var res = yield child_process_exec(cmd);
		console.log(res[0]);
		res[1] && console.log(res[1]);
	}

	// readJSON
	function *readJSON(file, defaultObject) {
		try {
			return JSON.parse(yield fs_readFile(file, {encoding: 'utf8'}));
		} catch (e) {
			if (defaultObject === undefined) throw e;
			return defaultObject;
		}
	}

	// writeJSON
	function *writeJSON(file, obj) {
		yield fs_writeFile(file, JSON.stringify(obj, null, '  ') + '\n', {encoding: 'utf8'});
	}

})();
