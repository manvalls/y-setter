# Setter [![Build Status][travis-img]][travis-url] [![Coverage Status][cover-img]][cover-url]

## Sample usage

```javascript
var Setter = require('y-setter'),

    setter = new Setter(),
    getter = setter.getter;

setter.value = 0;

getter.watch(function(value,previous){
  console.log(getter.value);
}); // 0

setter.value = 1; // 1
```

[travis-img]: https://travis-ci.org/manvalls/y-setter.svg?branch=master
[travis-url]: https://travis-ci.org/manvalls/y-setter
[cover-img]: https://coveralls.io/repos/manvalls/y-setter/badge.svg?branch=master&service=github
[cover-url]: https://coveralls.io/github/manvalls/y-setter?branch=master
