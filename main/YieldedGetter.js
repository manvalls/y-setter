var Resolver = require('y-resolver'),
    {Yielded} = Resolver,
    getYielded = require('./getters/getYielded'),
    Getter = require('./Getter'),
    parent = Symbol(),
    property = Symbol();

class YieldedGetter extends Getter{

  constructor(p, prop){
    super();
    this[parent] = p;
    this[property] = prop;
  }

  get value(){
    return Yielded.get(this[parent].value)[this[property]];
  }

  touched(){
    var yd = getYielded(Yielded.get(this[parent].value));
    if(!yd.done) return Resolver.race([this[parent].touched(), yd]);
    return this[parent].touched();
  }

  frozen(){
    return this[parent].frozen();
  }

}

/*/ exports /*/

module.exports = YieldedGetter;
