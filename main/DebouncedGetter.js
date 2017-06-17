var Resolver = require('y-resolver'),
    walk = require('y-walk'),
    {wait, frame} = require('y-timers'),
    ChildGetter = require('./ChildGetter'),
    lastValue = Symbol(),
    timeout = Symbol(),
    yielded = Symbol(),
    touched = Symbol();

class DebouncedGetter extends ChildGetter{

  constructor(parent, t){
    super(parent);
    this[timeout] = t;
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
  var result;

  yield this[touched]();

  do{

    result = yield {
      timeout: this[timeout] == null ? frame() : wait(this[timeout]),
      touched: this[touched]()
    };

  }while(!('timeout' in result));

  delete this[lastValue];
  delete this[yielded];
}

/*/ exports /*/

module.exports = DebouncedGetter;
