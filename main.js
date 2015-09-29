var getY = Symbol(),
    getV = Symbol(),

    value = Symbol(),
    getter = Symbol(),
    resolver = Symbol(),

    isSetter = 'o5CqYkOh5ezPpwT',
    isGetter = '3tPmTSBio57bVrt',

    Resolver,walk,Detacher,define,wait,
    bag;

/*/ exports /*/

module.exports = Setter;
Setter.Getter = Getter;
Setter.Hybrid = Hybrid;

Setter.is = isSetterFn;
Getter.is = isGetterFn;

/*/ imports /*/

Resolver = require('y-resolver');
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

  set value(v){
    var ov = this[value],
        r;

    this[value] = v;
    if(ov !== v && this[resolver]){
      r = this[resolver];
      delete this[resolver];
      r.accept();
    }

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

  get value(){
    var gv = this[getV];
    return gv[0].apply(gv[2],gv[1]);
  },

  valueOf: function(){
    return this.value;
  },

  get: function(){
    return new Getter(getProp,arguments,this,this[getY][0],this[getY][1],this[getY][2]);
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

    return new Getter(getTV,[getters,trn,thisArg],getTY,[getters]);
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

  writable: false

});

// - utils

function isGetterFn(obj){
  return !!obj && obj[isGetter];
}

function pauseIt(w){
  w.pause();
}

function* watchLoop(args,cb,that,dArgs){
  var ov,v;

  dArgs[0] = this;

  v = that.value;
  args[0] = v;
  args[1] = ov;

  walk(cb,args,that);
  ov = v;

  while(true){
    yield that.touched();

    v = that.value;
    args[0] = v;
    args[1] = ov;

    if(ov !== v) walk(cb,args,that);
    ov = v;
  }

}

function getTY(getters){
  var yds = [],
      i;

  for(i = 0;i < getters.length;i++){
    yds[i] = getters[i].touched();
  }

  return Resolver.race(yds);
}

function getTV(getters,trn,thisArg){
  var values = [],
      i;

  for(i = 0;i < getters.length;i++){
    values[i] = getters[i].value;
  }

  return trn.apply(thisArg || this,values);
}

function getProp(){
  var obj = this.value,
      i;

  for(i = 0;i < arguments.length;i++) obj = obj[arguments[i]];
  return obj;
}

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

function connect(v,ov,d,obj,key){
  obj[key] = v;
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
