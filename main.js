var getY = Symbol(),
    getV = Symbol(),
    getF = Symbol(),

    value = Symbol(),
    frozen = Symbol(),
    getter = Symbol(),
    setter = Symbol(),
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

/*/ imports /*/

Resolver = require('y-resolver');
Yielded = Resolver.Yielded;
walk = require('y-walk');
Detacher = require('detacher');
define = require('u-proto/define');
wait = require('y-timers/wait');

// Setter

function Setter(st,gt){

  if(arguments.length == 2){
    this[getter] = gt;
    this[setter] = st;
  }else{
    this[getter] = new Getter(getSV,[this],getSY,[this],getSF,[this]);
    this.value = arguments[0];
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
    if(this[frozen] && this[frozen].yielded.done) return;
    ov = this[value];
    this[value] = v;
    if(ov !== v) this.touch();
  },

  freeze: function(){
    if(this[setter]) return this[setter].freeze();
    this[frozen] = this[frozen] || new Resolver();
    this[frozen].accept();
  },

  touch: function(){
    var r;

    if(this[setter]) return this[setter].touch();
    r = this[resolver];
    if(!r) return;
    delete this[resolver];
    r.accept();
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
  if(!setter[resolver]) setter[resolver] = new Resolver();
  return setter[resolver].yielded;
}

function getSF(setter){
  setter[frozen] = setter[frozen] || new Resolver();
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
    return gf[0].apply(gf[2],gf[1]);
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
    return new Getter(this[getV][0],this[getV][1],this[getV][2],getThr,[timeout,this]);
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
    if(Setter.is(obj)) this.frozen().listen(obj.freeze,[],obj);
    return this.watch(connect,obj,key);
  },

  to: function(fn){
    var getters = [this],
        i;

    for(i = 1;i < arguments.length;i++) getters.push(arguments[i]);
    return transform(getters,fn,this);
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

  observe: function(ov,cb){
    var args = [],
        dArgs = [],
        d = new Detacher(pauseIt,dArgs),
        i;

    for(i = 2;i < arguments.length;i++) args[i + 1] = arguments[i];
    args[2] = d;

    walk(observeLoop,[args,cb,ov,this,dArgs]);
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

  // ebjs label

  ['3asKNsYzcdGduft']: 54

});

// - utils

function isGetterFn(obj){
  return !!obj && obj[isGetter];
}

function* getYielded(getter){
  while(!getter.value) yield getter.touched();
  return getter.value;
}

function through(v){ return v; }
function retYd(){ return (new Resolver()).yielded; }

// -- transform

function transform(getters,func,thisArg){
  return new Getter(getTV,[getters,func,thisArg],getTY,[getters],getTF,[getters]);
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

function getThr(timeout,that){
  var res;

  if(!this[resolver]){
    this[resolver] = res = new Resolver();
    that.touched().listen(delayer,[this,timeout]);
  }else res = this[resolver];

  return res.yielded;
}

function delayer(that,timeout){
  wait(timeout).listen(thrListener,[that]);
}

function thrListener(that){
  var res = that[resolver];

  delete that[resolver];
  res.accept();
}

// -- debounce

function getDeb(timeout,that){
  var res;

  if(!this[resolver]){
    this[resolver] = res = new Resolver();
    walk(debounce,[that,timeout],this);
  }else res = this[resolver];

  return res.yielded;
}

function* debounce(that,timeout){
  var result = {},
      res;

  yield that.touched();
  while(!('timeout' in result)) result = yield {
    timeout: wait(timeout),
    touched: that.touched()
  };

  res = this[resolver];
  delete this[resolver];
  res.accept();
}

// -- connect

function connect(v,ov,d,obj,key){
  obj[key] = v;
}

// -- watch and variants

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

function* observeLoop(args,cb,ov,that,dArgs){
  var v,yd;

  dArgs[0] = this;

  while(true){
    v = that.value;
    args[0] = v;
    args[1] = ov;

    yd = that.touched();
    if(ov !== v) walk(cb,args,that);
    ov = v;

    yield yd;
  }

}

// HybridGetter

function Hybrid(value){
  var s;

  if(value && Setter.is(value)) s = value;
  else s = new Setter(value);

  this[setter] = s;
  this[getter] = s.getter;

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

function getHY(getter){
  return getter.touched();
}

function getHF(getter){
  return getter.frozen();
}
