'use strict';

const http = require('http');
const aa = require('../aa');
const aa02 = require('../aa02');
let reqId = 1000;

http.createServer(aa.callback(function *(req, res) {
	const id = ++reqId;
	let count = 0;
	console.log(id, ++count, 'aa', new Date, req.method, req.url, req.httpVersion);
	yield aa.wait(3000);
	console.log(id, ++count, 'aa', new Date, req.method, req.url, req.httpVersion);
	res.end(`hello ${req.method} ${req.url}  ${req.httpVersion}`);
})).listen(process.env.PORT || 3000);

http.createServer(aa02.callback(function *(req, res) {
	const id = ++reqId;
	let count = 0;
	console.log(id, ++count, 'aa02', new Date, req.method, req.url, req.httpVersion);
	yield aa.wait(3000);
	console.log(id, ++count, 'aa02', new Date, req.method, req.url, req.httpVersion);
	res.end(`hello ${req.method} ${req.url}  ${req.httpVersion}`);
})).listen(3001);
