var Resolver = require('y-resolver'),
    Getter = require('../Getter'),
    Yielded = Resolver.Yielded;

module.exports = getters => {
  var yds = [],
      i;

  for(i = 0;i < getters.length;i++){

    if(Getter.is(getters[i])) yds.push(getters[i].frozen());
    else{
      if(getters[i] && typeof getters[i].then == 'function') getters[i] = Yielded.get(getters[i]);
      if(Yielded.is(getters[i]) && !getters[i].done) yds.push(Resolver.after(getters[i]));
    }

  }

  return Resolver.all(yds);
};
