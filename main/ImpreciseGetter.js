var Resolver = require('y-resolver'),
    walk = require('y-walk'),
    ChildGetter = require('./ChildGetter'),
    precision = Symbol(),
    value = Symbol(),
    lastValue = Symbol(),
    yielded = Symbol(),
    touched = Symbol();

class ImpreciseGetter extends ChildGetter{

  constructor(parent, prec){
    super(parent);
    this[precision] = prec;
  }

  touched(){

    if(!this[yielded]){
      this[lastValue] = super.value;
      this[yielded] = walk.onDemand(handler, [], this);
    }

    return this[yielded];
  }

  get value(){
    this.touched();
    return this[lastValue];
  }

  [touched](){
    return super.touched();
  }

  [value](){
    return super.value;
  }

}

function* handler(){
  yield this[touched]();
  while(Math.abs(this.value - this[value]()) < this[precision]) yield this[touched]();
  delete this[lastValue];
  delete this[yielded];
}

/*/ exports /*/

module.exports = ImpreciseGetter;
