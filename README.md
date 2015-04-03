[aa](https://www.npmjs.org/package/aa) - async await
====

INSTALL:
----

```bash
$ npm install aa
```

USAGE:
----

```js
var aa = require('aa');

var p = aa(function *() {
  yield 1;
  yield [1, 2, 3];
  return 'val';
});

p.then(
  function (val) {},
  function (err) { console.log(); }
);
```

LICENSE:
----

  MIT
