var Resolver = require('y-resolver'),
    walk = require('y-walk'),
    {frame, wait} = require('y-timers'),
    ChildGetter = require('./ChildGetter'),
    bounce = Symbol(),
    yielded = Symbol(),
    touched = Symbol(),
    timeout = Symbol();

class BouncedGetter extends ChildGetter{

  constructor(parent, t){
    super(parent);
    this[timeout] = t;
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
  if(ov !== this.value) this[bounce] = this[timeout] == null ? frame() : wait(this[timeout]);

  delete this[yielded];
  return force;
}

/*/ exports /*/

module.exports = BouncedGetter;
