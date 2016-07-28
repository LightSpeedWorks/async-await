'use strict';

const fs = require('fs');

let promises = ['promise-light', 'promise-thunk'].map(
	mod => ({name: mod, object: require(mod)})
);
promises.unshift({name: 'promise', object: Promise})

let keys = Object.keys(promises.reduce((z, x) => {
	Object.getOwnPropertyNames(x.object).forEach(p => {
		//if (typeof x.object[p] === 'function')
		z[p] = '';
	});
	return z;
}, {})).sort();

promises.forEach(x => {
	console.log('\n');
	let s = '';
	keys.forEach(p => {
		//if (typeof x.object[p] !== 'function') return;
		s += (x.object[p] + '').split('\n').map(s => p + ': ' + s)
			.join('\n') + '\n';
		let pd = Object.getOwnPropertyDescriptor(x.object, p) || {};
		console.log(x.name,
			(pd.writable     ? 'W' : 'w') +
			(pd.enumerable   ? 'E' : 'e') +
			(pd.configurable ? 'C' : 'c'),
			typeof pd.value === 'function' ?
				(pd.value + '') === (Promise[p] + '') ? '==' : '!='
				: '  ',
			typeof pd.value === 'number' ||
			typeof pd.value === 'string' ? pd.value : ' ',
			typeof pd.value,
			p);
			//console.log(p, Promise[p]);
	});
	fs.writeFileSync('zzz-' + x.name + '-contents.log', s);
	console.log('\n');
});
