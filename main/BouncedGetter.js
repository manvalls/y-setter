var Resolver = require('y-resolver'),
    walk = require('y-walk'),
    frame = require('y-timers/frame'),
    ChildGetter = require('./ChildGetter'),
    bounce = Symbol(),
    yielded = Symbol(),
    touched = Symbol();

class BouncedGetter extends ChildGetter{

  constructor(parent){
    super(parent);
  }

  touched(){
    this[yielded] = this[yielded] || walk(handler, [], this);
    if(this[bounce] && !this[bounce].done) return Resolver.race([this[bounce], this[yielded]]);
    return this[yielded];
  }

  [touched](){
    return super.touched();
  }

}

function* handler(){
  var force,ov;

  ov = this.value;
  force = yield this[touched]();
  if(ov !== this.value) this[bounce] = frame();

  delete this[yielded];
  return force;
}

/*/ exports /*/

module.exports = BouncedGetter;
