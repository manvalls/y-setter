var Resolver = require('y-resolver'),
    walk = require('y-walk'),
    {wait, frame} = require('y-timers'),
    ChildGetter = require('./ChildGetter'),
    value = Symbol(),
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
  var result,force;

  force = yield this[touched]();

  do{

    result = yield {
      timeout: this[timeout] == null ? frame() : wait(this[timeout]),
      touched: this[touched]()
    };

    force = force || result.touched;

  }while(!('timeout' in result));

  delete this[yielded];
  delete this[value];
  return force;
}

/*/ exports /*/

module.exports = DebouncedGetter;
