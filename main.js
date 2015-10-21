var getY = Symbol(),
    getV = Symbol(),

    value = Symbol(),
    getter = Symbol(),
    resolver = Symbol(),

    isSetter = 'o5CqYkOh5ezPpwT',
    isGetter = '3tPmTSBio57bVrt',

    Resolver,walk,Detacher,define,wait,
    bag,Yielded;

/*/ exports /*/

module.exports = Setter;
Setter.Getter = Getter;
Setter.Hybrid = Hybrid;
Setter.is = isSetterFn;

Getter.is = isGetterFn;
Getter.transform = transform;
Getter.concat = concat;

/*/ imports /*/

Resolver = require('y-resolver');
Yielded = Resolver.Yielded;
walk = require('y-walk');
Detacher = require('detacher');
define = require('u-proto/define');
wait = require('y-timers/wait');

// Setter

function Setter(value){
  this[getter] = new Getter(getSV,[this],getSY,[this]);
  this.value = value;
};

Setter.prototype[define](bag = {

  [isSetter]: true,

  get value(){
    return this[value];
  },

  touch: function(){
    var r = this[resolver];

    if(!r) return;
    delete this[resolver];
    r.accept();
  },

  set value(v){
    var ov = this[value];
    this[value] = v;
    if(ov !== v) this.touch();
  },

  get getter(){
    return this[getter];
  },

  valueOf: function(){
    return this.value;
  },

  writable: true

});

// - utils

function getSV(setter){
  return setter[value];
}

function getSY(setter){
  if(!setter[resolver]) setter[resolver] = new Resolver();
  return setter[resolver].yielded;
}

function isSetterFn(obj){
  return !!obj && obj[isSetter];
}

// Getter

function Getter(getValue,gvArgs,gvThat,getYielded,gyArgs,gyThat){

  if(arguments.length == 1)
    return new Getter(through,[arguments[0]],through,[(new Resolver()).yielded]);

  if(typeof gvArgs == 'function'){

    gyThat = getYielded;
    gyArgs = gvThat;
    getYielded = gvArgs;

    gvThat = null;
    gvArgs = null;

  }else if(typeof gvThat == 'function'){

    gyThat = gyArgs;
    gyArgs = getYielded;
    getYielded = gvThat;

    gvThat = null;

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

  valueOf: function(){
    return this.value;
  },

  get: function(){
    var getters = [this],
        i;

    for(i = 0;i < arguments.length;i++) getters.push(arguments[i]);
    return transform(getters,getProp);
  },

  run: function(){
    var getters = [this],
        i;

    for(i = 0;i < arguments.length;i++) getters.push(arguments[i]);
    return transform(getters,runIt);
  },

  debounce: function(timeout){
    return new Getter(this[getV][0],this[getV][1],this[getV][2],getDeb,[timeout,this]);
  },

  touched: function(){
    var gy = this[getY];
    return gy[0].apply(gy[2],gy[1]);
  },

  connect: function(obj,key){
    if(key == null) key = 'textContent' in obj ? 'textContent' : 'value';
    return this.watch(connect,obj,key);
  },

  to: function(){
    var getters = [this],
        i,trn,thisArg;

    for(i = 0;i < arguments.length;i++){

      if(typeof arguments[i] == 'function'){
        trn = arguments[i];
        thisArg = arguments[i + 1];
        break;
      }

      getters.push(arguments[i]);
    }

    return transform(getters,trn,thisArg);
  },

  watch: function(cb){
    var args = [],
        dArgs = [],
        d = new Detacher(pauseIt,dArgs),
        i;

    for(i = 1;i < arguments.length;i++) args[i + 2] = arguments[i];
    args[2] = d;

    walk(watchLoop,[args,cb,this,dArgs]);
    return d;
  },

  glance: function(cb){
    var args = [],
        dArgs = [],
        d = new Detacher(pauseIt,dArgs),
        i;

    for(i = 1;i < arguments.length;i++) args[i + 2] = arguments[i];
    args[2] = d;

    walk(glanceLoop,[args,cb,this,dArgs]);
    return d;
  },

  writable: false,

  // Simple transforms

  get not(){ return transform([this],invert); },
  get type(){ return transform([this],type); },

  is: function(v){ return transform([this,v],equal); },
  isNot: function(v){ return transform([this,v],notEqual); },
  equals: function(v){ return transform([this,v],strictEqual); },
  equalsNot: function(v){ return transform([this,v],strictNotEqual); },

  lt: function(v){ return transform([this,v],lt); },
  le: function(v){ return transform([this,v],le); },
  gt: function(v){ return transform([this,v],gt); },
  ge: function(v){ return transform([this,v],ge); },

  add: function(v){ return transform([this,v],add); },
  subs: function(v){ return transform([this,v],substract); },
  mb: function(v){ return transform([this,v],multiplyBy); },
  db: function(v){ return transform([this,v],divideBy); },

  iif: function(vt,vf){ return transform([this,vt,vf],iif); },
  and: function(v){ return transform([this,v],and); },
  or: function(v){ return transform([this,v],or); },

  isA: function(v){ return transform([this,v],isA); },
  isAn: function(v){ return transform([this,v],isA); },
  isNotA: function(v){ return transform([this,v],isNotA); },
  isNotAn: function(v){ return transform([this,v],isNotA); }

});

// - utils

function isGetterFn(obj){
  return !!obj && obj[isGetter];
}

function* getYielded(getter){
  while(!getter.value) yield getter.touched();
}

function through(v){ return v; }

// -- transform

function transform(getters,func,thisArg){
  return new Getter(getTV,[getters,func,thisArg],getTY,[getters]);
}

function getTY(getters){
  var yds = [],
      i;

  for(i = 0;i < getters.length;i++){
    if(Getter.is(getters[i])) yds.push(getters[i].touched());
  }

  return Resolver.race(yds);
}

function getTV(getters,trn,thisArg){
  var values = [],
      i;

  for(i = 0;i < getters.length;i++){
    if(Getter.is(getters[i])) values[i] = getters[i].value;
    else values[i] = getters[i];
  }

  return trn.apply(thisArg || this,values);
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

// -- concat

function concat(){
  return transform(arguments,concatTf);
}

function concatTf(){
  var result = '',
      i;

  for(i = 0;i < arguments.length;i++) result += arguments[i];
  return result;
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

// -- get

function getProp(){
  var obj = arguments[0],
      i;

  for(i = 1;i < arguments.length;i++) obj = obj[arguments[i]];
  return obj;
}

// -- debounce

function getDeb(timeout,that){
  var res;

  if(!this[resolver]){
    this[resolver] = res = new Resolver();
    that.touched().listen(delayer,[this,timeout]);
  }else res = this[resolver];

  return res.yielded;
}

function delayer(that,timeout){
  wait(timeout).listen(debListener,[that]);
}

function debListener(that){
  var res = that[resolver];

  delete that[resolver];
  res.accept();
}

// -- connect

function connect(v,ov,d,obj,key){
  obj[key] = v;
}

// -- watch and glance

function pauseIt(w){
  w.pause();
}

function* watchLoop(args,cb,that,dArgs){
  var ov,v,yd;

  dArgs[0] = this;

  v = that.value;
  args[0] = v;
  args[1] = ov;

  yd = that.touched();
  walk(cb,args,that);
  ov = v;

  while(true){
    yield yd;

    v = that.value;
    args[0] = v;
    args[1] = ov;

    yd = that.touched();
    if(ov !== v) walk(cb,args,that);
    ov = v;
  }

}

function* glanceLoop(args,cb,that,dArgs){
  var ov,v;

  dArgs[0] = this;

  v = that.value;
  args[0] = v;
  args[1] = ov;

  walk(cb,args,that);
  ov = that.value;

  while(true){
    yield that.touched();

    v = that.value;
    args[0] = v;
    args[1] = ov;

    if(ov !== v) walk(cb,args,that);
    ov = that.value;
  }

}

// HybridGetter

function Hybrid(value){

  this[getY] = [
    getSY,
    [this],
    this
  ];

  this[getV] = [
    getSV,
    [this],
    this
  ];

  this[getter] = this;
  this.value = value;
}

Hybrid.prototype = Object.create(Getter.prototype);

Hybrid.prototype[define](bag);
Hybrid.prototype[define]('constructor',Hybrid);
