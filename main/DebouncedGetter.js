var Resolver = require('y-resolver'),
    walk = require('y-walk'),
    wait = require('y-timers/wait'),
    ChildGetter = require('./ChildGetter'),
    timeout = Symbol(),
    yielded = Symbol(),
    touched = Symbol();

class DebouncedGetter extends ChildGetter{

  constructor(parent, t){
    super(parent);
    this[timeout] = t;
  }

  touched(){
    return this[yielded] = this[yielded] || walk(handler, [], this);
  }

  [touched](){
    return super.touched();
  }

}

function* handler(){
  var result,force;

  force = yield this[touched]();

  do{

    result = yield {
      timeout: wait(this[timeout]),
      touched: this[touched]()
    };

    force = force || result.touched;

  }while(!('timeout' in result));

  delete this[yielded];
  return force;
}

/*/ exports /*/

module.exports = DebouncedGetter;
