var Resolver = require('y-resolver'),
    walk = require('y-walk'),
    ChildGetter = require('./ChildGetter'),
    precision = Symbol(),
    yielded = Symbol(),
    touched = Symbol();

class ImpreciseGetter extends ChildGetter{

  constructor(parent, prec){
    super(parent);
    this[precision] = prec;
  }

  touched(){
    return this[yielded] = this[yielded] || walk(handler, [], this);
  }

  [touched](){
    return super.touched();
  }

}

function* handler(){
  var force,ov;

  ov = this.value;
  force = yield this[touched]();
  while(!force && Math.abs(ov - this.value) < this[precision]) force = yield this[touched]();

  delete this[yielded];
  return force;
}

/*/ exports /*/

module.exports = ImpreciseGetter;
