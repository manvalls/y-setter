# Setter

## Sample usage

```javascript
var Setter = require('y-setter'),
    
    setter = new Setter(),
    getter = setter.getter;

setter.value = 0;

walk(function*(){
  yield getter.change();
  console.log(getter.value); // 1
});

setter.value = 1;
```

