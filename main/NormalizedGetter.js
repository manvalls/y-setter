var Getter = require('./Getter'),
    frozen = require('./getters/frozen'),
    touched = require('./getters/touched'),
    object = Symbol();

class NormalizedGetter extends Getter{

  constructor(obj){
    super();
    this[object] = obj;
  }

  get value(){
    var wm = new WeakMap();
    return extract(this[object], wm);
  }

  touched(){
    var getters = [],
        ws = new WeakSet();

    fillGetters(this[object], getters, ws);
    return touched(getters);
  }

  frozen(){
    var getters = [],
        ws = new WeakSet();

    fillGetters(this[object], getters, ws);
    return frozen(getters);
  }

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

/*/ exports /*/

module.exports = NormalizedGetter;
