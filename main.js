var define = require('u-proto/define'),
    Resolver = require('y-resolver'),
    walk = require('y-walk'),
    Detacher = require('detacher'),

    getY = Symbol(),
    getV = Symbol(),

    value = Symbol(),
    getter = Symbol(),
    resolver = Symbol(),

    Setter,Getter,bag;

// Setter

Setter = function(){
  this[getter] = new Getter(getSV,[this],getSY,[this]);
};

Setter.prototype[define](bag = {

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

// Getter

Getter = function(getValue,gvArgs,gvThat,getYielded,gyArgs,gyThat){

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

  get value(){
    var gv = this[getV];
    return gv[0].apply(gv[2],gv[1]);
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

function pauseIt(w){
  w.pause();
}

function* watchLoop(args,cb,that,dArgs){
  var ov,v;

  dArgs[0] = this;

  while(true){

    v = that.value;
    args[0] = v;
    args[1] = ov;

    if(ov !== v) walk(cb,args,that);

    ov = v;
    yield that.touched();

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

function connect(v,ov,d,obj,key){
  obj[key] = v;
}

// HybridGetter

function Hybrid(){

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

}

Hybrid.prototype = Object.create(Getter.prototype);
Hybrid.prototype[define]('constructor',Hybrid);
Hybrid.prototype[define](bag);

/*/ exports /*/

module.exports = Setter;
Setter.Getter = Getter;
Setter.Hybrid = Hybrid;
