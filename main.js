var Su = require('u-su'),
    
    getter = Su(),
    inited = Su(),
    
    value = Su(),
    change = Su(),
    map = Su(),
    
    Resolver,Setter,Getter,Hybrid,bag;

// Setter

module.exports = Setter = function Setter(Constructor){
  Constructor = Constructor || Getter;
  this[getter] = new Constructor();
  this[getter][inited] = true;
};

Object.defineProperties(Setter.prototype,bag = {
  
  value: {
    set: function(v){
      var pv = this[getter][value],
          res;
      
      this[getter][value] = v;
      if(v != pv){
        res = this[getter][change];
        if(res){
          delete this[getter][change];
          res.accept();
        }
        
        res = this[getter][map][v];
        if(res){
          delete this[getter][map][v];
          res.accept();
        }
      }
    },
    get: function(){
      return this[getter][value];
    }
  },
  
  getter: {get: function(){
    return this[getter];
  }}
  
});

Resolver = require('y-resolver');

// Getter

Setter.Getter = Getter = function Getter(prop){
  if(this[inited]) return;
  
  if(prop){
    this[inited] = true;
    this[prop] = Object.create(Setter.prototype);
    this[prop][getter] = this;
  }
  
  this[map] = {};
};

Object.defineProperties(Getter.prototype,{
  
  value: {
    get: function(){
      return this[value];
    }
  },
  
  change: {value: function(v){
    
    if(arguments.length){
      if(!this[map][v]) this[map][v] = new Resolver();
      return this[map][v].yielded;
    }
    
    if(!this[change]) this[change] = new Resolver();
    return this[change].yielded;
  }}
  
});

// Hybrid

Setter.Hybrid = Hybrid = function Hybrid(){
  this[getter] = this;
  Getter.call(this);
  
  this[inited] = true;
};

Hybrid.prototype = new Getter();
Hybrid.prototype.constructor = Hybrid;

Object.defineProperties(Hybrid.prototype,bag);

// Auxiliar functions

Setter.chain = function(){
  var last = arguments[arguments.length - 1][getter],
      i;
  
  arguments[arguments.length - 1][getter] = arguments[0][getter];
  for(i = 0;i < arguments.length - 2;i++) arguments[i][getter] = arguments[i + 1][getter];
  arguments[arguments.length - 2][getter] = last;
};

