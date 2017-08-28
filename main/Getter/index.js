var trn = require('./transformations'),
    isGetter = '3tPmTSBio57bVrt',
    value = Symbol();

class Getter{

  // Static helpers

  static is(obj){
    return !!(obj && obj[isGetter]);
  }

  static get(value){
    var Setter = require('../Setter');

    if(Getter.is(value)) return value;
    if(Setter.is(value)) return value.getter;
    return new Getter(value);
  }

  static transform(getters, transformation, thisArg){
    var TransformedGetter = require('../TransformedGetter');
    return new TransformedGetter(getters, transformation, thisArg, true);
  }

  static forward(getters, transformation, thisArg){
    var TransformedGetter = require('../TransformedGetter');
    return new TransformedGetter(getters, transformation, thisArg, false);
  }

  static normalize(obj){
    var NormalizedGetter = require('../NormalizedGetter');
    return new NormalizedGetter(obj);
  }

  static map(){
    return Getter.transform(...arguments);
  }

  static watch(){
    return require('./watchers/watch')(...arguments);
  }

  static observe(){
    return require('./watchers/observe')(...arguments);
  }

  static glance(){
    return require('./watchers/glance')(...arguments);
  }

  static inside(obj){

    if(Getter.is(obj)) return true;

    if(obj instanceof Object && (obj.constructor == Array || obj.constructor == Object)){

      for(let value of Object.values(obj)){
        if(Getter.inside(value)) return true;
      }

    }

    return false;
  }

  // Default behaviour

  constructor(v){
    this[value] = v;
  }

  get value(){
    return this[value];
  }

  get v(){
    return this.value;
  }

  touched(){
    var {Yielded} = require('y-resolver');
    return new Yielded();
  }

  frozen(){
    return require('y-resolver').accept();
  }

  // Useful getters

  get writable(){ return false; }

  get [isGetter](){ return true; }

  valueOf(){
    return this.value;
  }

  [Symbol.iterator](){
    var arr = this.value || [];

    if(arr[Symbol.iterator]) return arr[Symbol.iterator](...arguments);
    return [][Symbol.iterator](...arguments);
  }

  // Promise utils

  ['4siciY0dau6kkit'](){
    return require('./getYielded')(this);
  }

  // Watcher methods

  watch(){
    return Getter.watch([this], ...arguments);
  }

  glance(){
    return Getter.glance([this], ...arguments);
  }

  observe(ov){
    var args = [],
        i;

    for(i = 1;i < arguments.length;i++) args.push(arguments[i]);
    return Getter.observe([this],[ov],...args);
  }

  // Connectors

  connect(){
    return require('./connectors/connect').apply(this,arguments);
  }

  pipe(){
    return require('./connectors/pipe').apply(this,arguments);
  }

  // Transformations

  to(fn){
    var getters = [this],
        i;

    for(i = 1;i < arguments.length;i++) getters.push(arguments[i]);
    return Getter.transform(getters, fn, this);
  }

  forward(fn){
    var getters = [this],
        i;

    for(i = 1;i < arguments.length;i++) getters.push(arguments[i]);
    return Getter.forward(getters, fn, this);
  }

  normalize(){
    return Getter.normalize(this);
  }

  get(){
    if(!arguments.length) return this.value;
    return this.to(trn.get, ...arguments);
  }

  throttle(){
    var ThrottledGetter = require('../ThrottledGetter');
    return new ThrottledGetter(this, ...arguments);
  }

  debounce(){
    var DebouncedGetter = require('../DebouncedGetter');
    return new DebouncedGetter(this, ...arguments);
  }

  bounce(){
    var BouncedGetter = require('../BouncedGetter');
    return new BouncedGetter(this, ...arguments);
  }

  precision(){
    var ImpreciseGetter = require('../ImpreciseGetter');
    return new ImpreciseGetter(this, ...arguments);
  }

  get readonly(){
    var ChildGetter = require('../ChildGetter');
    return new ChildGetter(this);
  }

  get not(){ return this.to(trn.invert); }
  get type(){ return this.to(trn.type); }
  get isNull(){ return this.is(null); }
  get isNotNull(){ return this.isNot(null); }
  get void(){ return new Getter(); }

  get done(){
    var YieldedGetter = require('../YieldedGetter');
    return new YieldedGetter(this, 'done');
  }

  get success(){
    var YieldedGetter = require('../YieldedGetter');
    return new YieldedGetter(this, 'accepted');
  }

  get failure(){
    var YieldedGetter = require('../YieldedGetter');
    return new YieldedGetter(this, 'rejected');
  }

  get result(){
    var YieldedGetter = require('../YieldedGetter');
    return new YieldedGetter(this, 'value');
  }

  get error(){
    var YieldedGetter = require('../YieldedGetter');
    return new YieldedGetter(this, 'error');
  }

  is(v){ return this.to(trn.equal, v); }
  isNot(v){ return this.to(trn.notEqual, v); }
  equals(v){ return this.to(trn.strictEqual, v); }
  equalsNot(v){ return this.to(trn.strictNotEqual, v); }

  lt(v){ return this.to(trn.lt, v); }
  le(v){ return this.to(trn.le, v); }
  gt(v){ return this.to(trn.gt, v); }
  ge(v){ return this.to(trn.ge, v); }

  pl(v){ return this.to(trn.add, v); }
  mn(v){ return this.to(trn.substract, v); }
  mb(v){ return this.to(trn.multiplyBy, v); }
  db(v){ return this.to(trn.divideBy, v); }

  iif(vt,vf){ return this.to(trn.iif, vt, vf); }
  and(v){ return this.to(trn.and, v); }
  or(v){ return this.to(trn.or, v); }

  isA(v){ return this.to(trn.isA, v); }
  isAn(v){ return this.to(trn.isA, v); }
  isNotA(v){ return this.to(trn.isNotA, v); }
  isNotAn(v){ return this.to(trn.isNotA, v); }

  call(){ return this.to(trn.call, ...arguments); }
  run(){ return this.to(trn.run, ...arguments); }
  math(){ return this.to(trn.math, ...arguments); }
  get resc(){ return this.to(trn.resc); }
  map(){ return this.to(...arguments); }

  // ebjs label

  get [Symbol.for('ebjs/label')](){ return 54; }

}

/*/ exports /*/

module.exports = Getter;
