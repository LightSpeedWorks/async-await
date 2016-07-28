'use strict';

const fs = require('fs');

let aas = ['aa', 'aa01', 'aa02'].map(
	mod => ({name: mod, object: require('../' + mod)})
);

let keys = Object.keys(aas.reduce((z, x) => {
	Object.getOwnPropertyNames(x.object).forEach(p => {
		//if (typeof x.object[p] === 'function')
		z[p] = '';
	});
	return z;
}, {})).sort();

let aa = aas[0].object;

aas.forEach(x => {
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
				(pd.value + '') === (aa[p] + '') ? '==' : '!='
				: '  ',
			typeof pd.value === 'number' ||
			typeof pd.value === 'string' ? pd.value : ' ',
			typeof pd.value,
			p);
			//console.log(p, aa[p]);
	});
	fs.writeFileSync('zzz-' + x.name + '-contents.log', s);
	console.log('\n');
});
