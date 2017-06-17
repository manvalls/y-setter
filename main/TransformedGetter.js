var Getter = require('./Getter'),
    values = require('./getters/values'),
    frozen = require('./getters/frozen'),
    touched = require('./getters/touched'),
    walk = require('y-walk'),
    yielded = Symbol(),
    frozenYd = Symbol(),
    lastValue = Symbol(),
    args = Symbol();

class TransformedGetter extends Getter{

  constructor(getters, transformation, thisArg, doNotForward){
    super();
    this[args] = {getters, transformation, thisArg, doNotForward};
  }

  get value(){
    this.touched();
    return this[lastValue];
  }

  touched(){
    var {getters, transformation, thisArg} = this[args];

    if(!this[yielded]){
      this[lastValue] = transformation.apply(thisArg || this, values(getters));
      this[yielded] = walk.onDemand(handler, [], this);
    }

    return this[yielded];
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
    return this[frozenYd] = this[frozenYd] || frozen(getters);
  }

}

function* handler(){
  var {getters, transformation, thisArg, doNotForward} = this[args],
      newValue;

  yield touched(getters, doNotForward);
  while(this[lastValue] === (newValue = transformation.apply(thisArg || this, values(getters)))){
    yield touched(getters, doNotForward);
  }

  delete this[lastValue];
  delete this[yielded];

  this[lastValue] = newValue;
  this[yielded] = walk.onDemand(handler, [], this);

}

/*/ exports /*/

module.exports = TransformedGetter;
