var Resolver = require('y-resolver'),
    Getter = require('../Getter'),
    Yielded = Resolver.Yielded;

module.exports = getters => {
  var values = [],
      i;

  for(i = 0;i < getters.length;i++){

    if(getters[i] && typeof getters[i].then == 'function') getters[i] = Yielded.get(getters[i]);

    if(Getter.is(getters[i]) || Yielded.is(getters[i])) values[i] = getters[i].value;
    else values[i] = getters[i];

  }

  return values;
};
