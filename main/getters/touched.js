var Resolver = require('y-resolver'),
    walk = require('y-walk'),
    Getter = require('../Getter'),
    Yielded = Resolver.Yielded;

module.exports = walk.wrap(function*(getters, doNotForward){
  var yds = [],
      result, i;

  for(i = 0;i < getters.length;i++){

    if(Getter.is(getters[i])) yds.push(getters[i].touched());
    else{
      if(getters[i] && typeof getters[i].then == 'function') getters[i] = Yielded.get(getters[i]);
      if(Yielded.is(getters[i]) && !getters[i].done) yds.push(Resolver.after(getters[i]));
    }

  }

  result = yield Resolver.race(yds);
  if(doNotForward) return false;
  return result;
});
