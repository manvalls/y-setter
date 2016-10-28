var getY = Symbol(),
    getV = Symbol(),
    getF = Symbol(),

    value = Symbol(),
    frozen = Symbol(),
    getter = Symbol(),
    setter = Symbol(),
    resolver = Symbol(),
    parent = Symbol(),

    isSetter = 'o5CqYkOh5ezPpwT',
    isGetter = '3tPmTSBio57bVrt',

    defaultSetter = {
      set: (obj,key,value) => obj[key] !== value ? obj[key] = value : value
    },

    Resolver,walk,Detacher,define,wait,
    bag,Yielded;

/*/ exports /*/

module.exports = Setter;
Setter.Getter = Getter;
Setter.Hybrid = Hybrid;
Setter.is = isSetterFn;

Getter.is = isGetterFn;
Getter.transform = transform;
Getter.watch = watchAll;
Getter.observe = observeAll;
Getter.glance = glanceAll;

/*/ imports /*/

Resolver = require('y-resolver');
Yielded = Resolver.Yielded;
walk = require('y-walk');
Detacher = require('detacher');
define = require('u-proto/define');
wait = require('y-timers/wait');

// Setter

function Setter(){

  if(Setter.is(arguments[0]) && Getter.is(arguments[1])){
    this[setter] = arguments[0];
    this[getter] = arguments[1];
  }else{

    this[getter] = new Getter(getSV,[this],getSY,[this],getSF,[this]);
    this.value = arguments[0];

    if(Yielded.is(arguments[0])) this[parent] = arguments[0];
    else this.value = arguments[0];

  }

};

Setter.prototype[define](bag = {

  [isSetter]: true,

  get value(){
    if(this[setter]) return this[getter].value;
    return this[value];
  },

  set value(v){
    var ov;

    if(this[setter]) return this[setter].value = v;

    if(
      (this[frozen] && this[frozen].yielded.done) ||
      (this[parent] && this[parent].done)
    ) return;

    ov = this[value];
    this[value] = v;
    if(ov !== v) this.touch();
  },

  freeze: function(){
    if(this[setter]) return this[setter].freeze();
    this[frozen] = this[frozen] || new Resolver();
    this[frozen].accept();
  },

  update: function(){
    var r;

    if(this[setter]) return this[setter].update();
    r = this[resolver];
    if(!r) return;
    delete this[resolver];
    r.accept(true);
  },

  touch: function(){
    var r;

    if(this[setter]) return this[setter].touch();
    r = this[resolver];
    if(!r) return;
    delete this[resolver];
    r.accept(false);
  },

  set: function(v){
    this.value = v;
  },

  get getter(){
    return this[getter];
  },

  valueOf: function(){
    return this.value;
  },

  writable: true,

  // ebjs label

  ['3asKNsYzcdGduft']: 55

});

// - utils

function getSV(setter){
  return setter[value];
}

function getSY(setter){

  if(
    (setter[frozen] && setter[frozen].yielded.done) ||
    (setter[parent] && setter[parent].done)
  ) return new Yielded();

  if(!setter[resolver]) setter[resolver] = new Resolver();
  return setter[resolver].yielded;
}

function getSF(setter){
  setter[frozen] = setter[frozen] || new Resolver();
  if(setter[parent]) return Resolver.race([setter[frozen].yielded,setter[parent]]);
  return setter[frozen].yielded;
}

function isSetterFn(obj){
  return !!obj && obj[isSetter];
}

// Getter

function Getter(getValue,gvArgs,gvThat,getYielded,gyArgs,gyThat,getFrozen,gfArgs,gfThat){

  if(arguments.length == 1)
    return new Getter(through,[arguments[0]],through,[(new Resolver()).yielded]);

  if(typeof gvArgs == 'function'){

    gfThat = getFrozen;
    gfArgs = gyThat;
    getFrozen = gyArgs;
    gyThat = getYielded;
    gyArgs = gvThat;
    getYielded = gvArgs;

    gvThat = null;
    gvArgs = null;

  }else if(typeof gvThat == 'function'){

    gfThat = gfArgs;
    gfArgs = getFrozen;
    getFrozen = gyThat;
    gyThat = gyArgs;
    gyArgs = getYielded;
    getYielded = gvThat;

    gvThat = null;

  }

  if(typeof gyArgs == 'function'){

    gfThat = getFrozen;
    gfArgs = gyThat;
    getFrozen = gyArgs;

    gyThat = null;
    gyArgs = null;

  }else if(typeof gyThat == 'function'){

    gfThat = gfArgs;
    gfArgs = getFrozen;
    getFrozen = gyThat;

    gyThat = null;

  }

  this[getY] = [
    getYielded,
    gyArgs || [],
    gyThat || this
  ];

  this[getV] = [
    getValue,
    gvArgs || [],
    gvThat || this
  ];

  this[getF] = [
    getFrozen || retYd,
    gfArgs || [],
    gfThat || this
  ];

};

Getter.prototype[define]({

  [isGetter]: true,

  [Yielded.getter]: function(){
    return walk(getYielded,[this]);
  },

  get value(){
    var gv = this[getV];
    return gv[0].apply(gv[2],gv[1]);
  },

  frozen: function(){
    var gf = this[getF];
    return gf[0].call(gf[2],...gf[1],...arguments);
  },

  valueOf: function(){
    return this.value;
  },

  get: function(){
    var getters,i;
    if(!arguments.length) return this.value;

    getters = [this];
    for(i = 0;i < arguments.length;i++) getters.push(arguments[i]);
    return transform(getters,getProp);
  },

  run: function(){
    var getters = [this],
        i;

    for(i = 0;i < arguments.length;i++) getters.push(arguments[i]);
    return transform(getters,runIt);
  },

  call: function(){
    var getters = [this],
        i;

    for(i = 0;i < arguments.length;i++) getters.push(arguments[i]);
    return transform(getters,callIt);
  },

  throttle: function(timeout){
    return new Getter(...this[getV],getThr,[timeout,this],{lastTime: 0},...this[getF]);
  },

  debounce: function(timeout){
    return new Getter(...this[getV],getDeb,[timeout,this],...this[getF]);
  },

  precision: function(prec){
    return new Getter(...this[getV],getPrec,[prec,this],...this[getF]);
  },

  touched: function(){
    var gy = this[getY];
    return gy[0].call(gy[2],...gy[1],...arguments);
  },

  connect: function(obj,keys,setter){
    var d;

    if(keys == null) keys = ['textContent' in obj ? 'textContent' : 'value'];
    else if(typeof keys == 'string') keys = [keys];

    if(typeof setter == 'function') setter = {set: setter};
    setter = setter || defaultSetter;

    d = this.watch(connect,obj,keys,setter);

    if(Setter.is(obj) && keys.length == 1 && keys[0] == 'value'){
      this.frozen().listen(obj.freeze,[],obj);
      obj.getter.frozen().listen(d.detach,[],d);
    }

    return d;
  },

  pipe: function(obj,keys,setter){
    var d;

    if(keys == null) keys = ['textContent' in obj ? 'textContent' : 'value'];
    else if(typeof keys == 'string') keys = [keys];

    if(typeof setter == 'function') setter = {set: setter};
    setter = setter || defaultSetter;

    d = this.watch(pipe,obj,keys,setter);
    if(Setter.is(obj) && keys.length == 1 && keys[0] == 'value') obj.getter.frozen().listen(d.detach,[],d);
    return d;
  },

  to: function(fn){
    var getters = [this],
        i;

    for(i = 1;i < arguments.length;i++) getters.push(arguments[i]);
    return transform(getters,fn,this);
  },

  watch: function(){
    return watchAll([this],...arguments);
  },

  glance: function(){
    return glanceAll([this],...arguments);
  },

  observe: function(ov){
    var args = [],
        i;

    for(i = 1;i < arguments.length;i++) args.push(arguments[i]);
    return observeAll([this],[ov],...args);
  },

  writable: false,

  // Simple transforms

  get not(){ return transform([this],invert); },
  get type(){ return transform([this],type); },
  get readonly(){ return new Getter(...this[getV],...this[getY],...this[getF]); },

  is: function(v){ return transform([this,v],equal); },
  isNot: function(v){ return transform([this,v],notEqual); },
  equals: function(v){ return transform([this,v],strictEqual); },
  equalsNot: function(v){ return transform([this,v],strictNotEqual); },

  lt: function(v){ return transform([this,v],lt); },
  le: function(v){ return transform([this,v],le); },
  gt: function(v){ return transform([this,v],gt); },
  ge: function(v){ return transform([this,v],ge); },

  pl: function(v){ return transform([this,v],add); },
  mn: function(v){ return transform([this,v],substract); },
  mb: function(v){ return transform([this,v],multiplyBy); },
  db: function(v){ return transform([this,v],divideBy); },

  iif: function(vt,vf){ return transform([this,vt,vf],iif); },
  and: function(v){ return transform([this,v],and); },
  or: function(v){ return transform([this,v],or); },

  isA: function(v){ return transform([this,v],isA); },
  isAn: function(v){ return transform([this,v],isA); },
  isNotA: function(v){ return transform([this,v],isNotA); },
  isNotAn: function(v){ return transform([this,v],isNotA); },

  math: function(){ return transform([this,...arguments],math); },

  // ebjs label

  ['3asKNsYzcdGduft']: 54

});

// - utils

function isGetterFn(obj){
  return !!obj && obj[isGetter];
}

function* getYielded(getter){
  var v,ov;

  v = getter.value;
  while(!v){
    yield getter.touched(v,ov);
    ov = v;
    v = getter.value;
  }

  return getter.value;
}

function through(v){ return v; }
function retYd(){ return (new Resolver()).yielded; }

// -- watchAll and glanceAll

function pauseIt(w){
  w.pause();
}

function watchAll(getters,cb){
  var args = [],
      dArgs = [],
      d = new Detacher(pauseIt,dArgs),
      i;

  for(i = 2;i < arguments.length;i++) args.push(arguments[i]);
  walk(watchAllLoop,[args,d,cb,getters,dArgs]);
  return d;
}

function* watchAllLoop(args,d,cb,getters,dArgs){
  var wasTheSame = false,
      ov,v,yd,update,getter;

  dArgs[0] = this;

  v = [];
  ov = [];

  for(getter of getters){
    v.push(getter.value);
    ov.push(undefined);
  }

  yd = getTY(getters,!wasTheSame);
  walk(cb,[...v,...ov,d,...args],getters[0]);
  ov = v;

  while(true){
    update = yield yd;

    v = [];
    for(getter of getters) v.push(getter.value);

    yd = getTY(getters,!wasTheSame);
    wasTheSame = sameArray(v,ov);
    if(update || !wasTheSame) walk(cb,[...v,...ov,d,...args],getters[0]);
    ov = v;
  }

}

function glanceAll(getters,cb){
  var args = [],
      dArgs = [],
      d = new Detacher(pauseIt,dArgs),
      i;

  for(i = 2;i < arguments.length;i++) args.push(arguments[i]);
  walk(glanceAllLoop,[args,d,cb,getters,dArgs]);
  return d;
}

function* glanceAllLoop(args,d,cb,getters,dArgs){
  var wasTheSame = false,
      ov,v,update,getter;

  dArgs[0] = this;

  v = [];
  ov = [];

  for(getter of getters){
    v.push(getter.value);
    ov.push(undefined);
  }

  walk(cb,[...v,...ov,d,...args],getters[0]);

  ov = [];
  for(getter of getters) ov.push(getter.value);

  while(true){
    update = yield getTY(getters,!wasTheSame);

    v = [];
    for(getter of getters) v.push(getter.value);
    wasTheSame = sameArray(v,ov);
    if(update || !wasTheSame) walk(cb,[...v,...ov,d,...args],getters[0]);

    ov = [];
    for(getter of getters) ov.push(getter.value);
  }

}

function observeAll(getters,ov,cb){
  var args = [],
      dArgs = [],
      d = new Detacher(pauseIt,dArgs),
      i;

  for(i = 3;i < arguments.length;i++) args.push(arguments[i])
  walk(observeAllLoop,[args,d,cb,ov,getters,dArgs]);
  return d;
}

function* observeAllLoop(args,d,cb,ov,getters,dArgs){
  var v,yd,getter,update;

  dArgs[0] = this;
  while(true){
    update = yield yd;

    v = [];
    for(getter of getters) v.push(getter.value);

    yd = getTY(getters);
    if(update || !sameArray(v,ov)) walk(cb,[...v,...ov,d,...args],getters[0]);
    ov = v;
  }

}

function sameArray(a1,a2){
  var i;

  if(a1.length != a2.length) return false;
  for(i = 0;i < a1.length;i++) if(a1[i] !== a2[i]) return false;
  return true;
}

// -- transform

function transform(getters,func,thisArg){
  return new Getter(getTV,[getters,func,thisArg],getTY,[getters],getTF,[getters]);
}

function getTY(getters,...args){
  var yds = [],
      i;

  for(i = 0;i < getters.length;i++){
    if(Getter.is(getters[i])) yds.push(getters[i].touched(...args));
    else if(Yielded.is(getters[i]) && !getters[i].done) yds.push(getters[i]);
  }

  return Resolver.race(yds);
}

function getTV(getters,trn,thisArg){
  var values = [],
      i;

  for(i = 0;i < getters.length;i++){
    if(Getter.is(getters[i]) || Yielded.is(getters[i])) values[i] = getters[i].value;
    else values[i] = getters[i];
  }

  return trn.apply(thisArg || this,values);
}

function getTF(getters){
  var yds = [],
      i;

  for(i = 0;i < getters.length;i++){
    if(Getter.is(getters[i])) yds.push(getters[i].frozen());
  }

  return Resolver.all(yds);
}

// -- Simple transforms

function equal(v1,v2){ return v1 == v2; }
function notEqual(v1,v2){ return v1 != v2; }
function strictEqual(v1,v2){ return v1 === v2; }
function strictNotEqual(v1,v2){ return v1 !== v2; }

function invert(v){ return !v; }
function type(v){ return typeof v; }

function lt(v1,v2){ return v1 < v2; }
function le(v1,v2){ return v1 <= v2; }
function gt(v1,v2){ return v1 > v2; }
function ge(v1,v2){ return v1 >= v2; }

function add(v1,v2){ return v1 + v2; }
function substract(v1,v2){ return v1 - v2; }
function multiplyBy(v1,v2){ return v1 * v2; }
function divideBy(v1,v2){ return v1 / v2; }

function iif(v,vt,vf){ return v ? vt : vf; }
function and(v1,v2){ return v1 && v2; }
function or(v1,v2){ return v1 || v2; }

function isA(v1,v2){ return v1 instanceof v2; }
function isNotA(v1,v2){ return !(v1 instanceof v2); }

function math(){
  var args = [],
      method,i;

  args.push(arguments[0]);
  method = arguments[1];
  for(i = 2;i < arguments.length;i++) args.push(arguments[i]);
  return Math[method](...args);
}

// -- run and call

function runIt(){
  var obj = arguments[0],
      func = obj[arguments[1]],
      args = [],
      i;

  for(i = 2;i < arguments.length;i++) args.push(arguments[i]);
  return func.apply(obj,args);
}

function callIt(){
  var func = arguments[0],
      args = [],
      i;

  for(i = 1;i < arguments.length;i++) args.push(arguments[i]);
  return func.apply(this,args);
}

// -- get

function getProp(){
  var obj = arguments[0],
      i;

  for(i = 1;i < arguments.length;i++){
    if(obj == null) obj = {};
    obj = obj[arguments[i]];
  }

  return obj;
}

// -- throttle

function getThr(timeout,that,...args){
  var res;

  if(!this.resolver){
    this.resolver = res = new Resolver();
    walk(throttle,[that,timeout,args],this);
  }else res = this.resolver;

  return res.yielded;
}

function* throttle(that,timeout,args){
  var result,res,force,t;

  force = yield that.touched(...args);
  t = wait(timeout - (Date.now() - this.lastTime));

  do{

    result = yield {
      timeout: t,
      touched: that.touched(...args)
    };

    force = force || result.touched;

  }while(!('timeout' in result));

  this.lastTime = Date.now();
  res = this.resolver;
  delete this.resolver;
  res.accept(force);

}

// -- debounce

function getDeb(timeout,that,...args){
  var res;

  if(!this[resolver]){
    this[resolver] = res = new Resolver();
    walk(debounce,[that,timeout,args],this);
  }else res = this[resolver];

  return res.yielded;
}

function* debounce(that,timeout,args){
  var result,res,force;

  force = yield that.touched(...args);

  do{

    result = yield {
      timeout: wait(timeout),
      touched: that.touched(...args)
    };

    force = force || result.touched;

  }while(!('timeout' in result));

  res = this[resolver];
  delete this[resolver];
  res.accept(force);
}

// -- precision

function getPrec(prec,that,...args){
  var res;

  if(!this[resolver]){
    this[resolver] = res = new Resolver();
    walk(precision,[that,prec,args],this);
  }else res = this[resolver];

  return res.yielded;
}

function* precision(that,prec,args){
  var result,res,force,ov;

  ov = that.value;
  force = yield that.touched(...args);
  while(!force && Math.abs(ov - that.value) < prec) force = yield that.touched(...args);

  res = this[resolver];
  delete this[resolver];
  res.accept(force);
}

// -- connect

function connect(v,ov,d,obj,keys,setter){
  var i,key;

  for(i = 0;i < keys.length - 1;i++) obj = obj[keys[i]] || {};
  key = keys[i];

  try{ setter.set(obj,key,v); }catch(e){}
}

// -- pipe

function pipe(v,ov,d,obj,keys,setter){
  var i,key;

  for(i = 0;i < keys.length - 1;i++) obj = obj[keys[i]] || {};
  key = keys[i];

  if(v !== undefined) try{ setter.set(obj,key,v); }catch(e){}
}

// HybridGetter

function Hybrid(value){
  var s;

  if(value && Setter.is(value)) s = value;
  else s = new Setter(value);

  this[setter] = s;
  this[getter] = s.getter;

  this[getV] = [
    getHV,
    [s.getter],
    this
  ];

  this[getY] = [
    getHY,
    [s.getter],
    this
  ];

  this[getF] = [
    getHF,
    [s.getter],
    this
  ];

}

Hybrid.prototype = Object.create(Getter.prototype);

Hybrid.prototype[define]('3asKNsYzcdGduft',56);
Hybrid.prototype[define](bag);
Hybrid.prototype[define]('constructor',Hybrid);

// - utils

function getHV(getter){
  return getter.value;
}

function getHY(getter,...args){
  return getter.touched(...args);
}

function getHF(getter,...args){
  return getter.frozen(...args);
}
