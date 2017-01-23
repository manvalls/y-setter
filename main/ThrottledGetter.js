var Resolver = require('y-resolver'),
    walk = require('y-walk'),
    wait = require('y-timers/wait'),
    ChildGetter = require('./ChildGetter'),
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
    return this[yielded] = this[yielded] || walk(handler, [], this);
  }

  [touched](){
    return super.touched();
  }

}

function* handler(){
  var result,force,t;

  force = yield this[touched]();
  t = wait(this[timeout] - (Date.now() - this[lastTime]));

  do{

    result = yield {
      timeout: t,
      touched: this[touched]()
    };

    force = force || result.touched;

  }while(!('timeout' in result));

  this[lastTime] = Date.now();
  delete this[yielded];
  return force;
}

/*/ exports /*/

module.exports = ThrottledGetter;
