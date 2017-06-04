var Resolver = require('y-resolver'),
    walk = require('y-walk'),
    {wait, frame} = require('y-timers'),
    ChildGetter = require('./ChildGetter'),
    value = Symbol(),
    timeout = Symbol(),
    yielded = Symbol(),
    touched = Symbol(),
    lastTime = Symbol();

class ThrottledGetter extends ChildGetter{

  constructor(parent, t){
    super(parent);
    this[timeout] = t;
    this[lastTime] = 0;
  }

  touched(){

    if(!this[yielded]){
      this[value] = this.value;
      this[yielded] = walk(handler, [], this);
    }

    return this[yielded];
  }

  get value(){
    if(this[yielded]) return this[value];
    return super.value;
  }

  [touched](){
    return super.touched();
  }

}

function* handler(){
  var result,force,t;

  force = yield this[touched]();
  t = this[timeout] == null ? frame() : wait(this[timeout] - (Date.now() - this[lastTime]));

  do{

    result = yield {
      timeout: t,
      touched: this[touched]()
    };

    force = force || result.touched;

  }while(!('timeout' in result));

  this[lastTime] = Date.now();
  delete this[yielded];
  delete this[value];
  return force;
}

/*/ exports /*/

module.exports = ThrottledGetter;
