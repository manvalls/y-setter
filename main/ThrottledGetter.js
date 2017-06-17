var Resolver = require('y-resolver'),
    walk = require('y-walk'),
    {wait, frame} = require('y-timers'),
    ChildGetter = require('./ChildGetter'),
    lastValue = Symbol(),
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

}

function* handler(){
  var result,t;

  yield this[touched]();
  t = this[timeout] == null ? frame() : wait(this[timeout] - (Date.now() - this[lastTime]));

  do{

    result = yield {
      timeout: t,
      touched: this[touched]()
    };

  }while(!('timeout' in result));

  this[lastTime] = Date.now();
  delete this[lastValue];
  delete this[yielded];
}

/*/ exports /*/

module.exports = ThrottledGetter;
