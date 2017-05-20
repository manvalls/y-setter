var Getter = require('./Getter'),
    values = require('./getters/values'),
    frozen = require('./getters/frozen'),
    touched = require('./getters/touched'),
    args = Symbol();

class TransformedGetter extends Getter{

  constructor(getters, transformation, thisArg, doNotForward){
    super();
    this[args] = {getters, transformation, thisArg, doNotForward};
  }

  get value(){
    var {getters, transformation, thisArg} = this[args];
    return transformation.apply(thisArg || this, values(getters));
  }

  touched(){
    var {getters, doNotForward} = this[args];
    return touched(getters, doNotForward);
  }

  frozen(){
    var {getters} = this[args];
    return frozen(getters);
  }

}

/*/ exports /*/

module.exports = TransformedGetter;
