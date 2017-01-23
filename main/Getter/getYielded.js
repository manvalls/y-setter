var walk = require('y-walk');

module.exports = walk.wrap(function*(getter){
  var v = getter.value;

  while(!v){
    yield getter.touched();
    v = getter.value;
  }

  return v;
});
