var Getter = require('./Getter'),
    frozen = require('./getters/frozen'),
    touched = require('./getters/touched'),
    walk = require('y-walk'),
    lastValue = Symbol(),
    lastGetters = Symbol(),
    frozenYd = Symbol(),
    yielded = Symbol(),
    object = Symbol();

class NormalizedGetter extends Getter{

  constructor(obj){
    super();
    this[object] = obj;
  }

  touched(){

    if(!this[yielded]){
      this[lastGetters] = [];
      fillGetters(this[object], this[lastGetters], new WeakSet());

      this[lastValue] = extract(this[object], new WeakMap());
      this[yielded] = touched(this[lastGetters]);
      this[yielded].listen(cleanup, [], this);
    }

    return this[yielded];
  }

  get value(){
    this.touched();
    return this[lastValue];
  }

  frozen(){
    return this[frozenYd] = this[frozenYd] || walk.onDemand(handleFrozen, [], this);
  }

}

function cleanup(){
  delete this[lastGetters];
  delete this[lastValue];
  delete this[yielded];
}

function fillGetters(obj, getters, ws){

  if(Getter.is(obj)){
    if(ws.has(obj)) return;
    ws.add(obj);
    getters.push(obj);
    return fillGetters(obj.value, getters, ws);
  }

  if(obj instanceof Object && (obj.constructor == Array || obj.constructor == Object)){

    if(ws.has(obj)) return;
    ws.add(obj);

    for(let value of Object.values(obj)){
      fillGetters(value, getters, ws);
    }

  }

}

function extract(obj, wm){
  var ret;

  if(Getter.is(obj)){
    if(wm.has(obj)) return wm.get(obj);
    wm.set(obj, {});
    ret = extract(obj.value, wm);
    wm.set(obj, ret);
    return ret;
  }

  if(obj instanceof Object && (obj.constructor == Array || obj.constructor == Object)){

    if(obj.constructor == Array) ret = [];
    else ret = {};

    if(wm.has(obj)) return wm.get(obj);
    wm.set(obj, ret);

    for(let [key, value] of Object.entries(obj)){
      ret[key] = extract(value, wm);
    }

    return ret;
  }

  return obj;
}

function* handleFrozen(){
  var touched = this.touched();

  while(true){
    let result = yield {
      touched: touched,
      frozen: frozen(this[lastGetters])
    };

    if('frozen' in result) return;
    touched = this.touched();
  }

}

/*/ exports /*/

module.exports = NormalizedGetter;
