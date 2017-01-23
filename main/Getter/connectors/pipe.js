var Setter = require('../../Setter'),
    defaultSetter = {
      set: (obj,key,value) => obj[key] !== value ? obj[key] = value : value,
      ignoredValue: undefined
    };

module.exports = function(obj,keys,setter){
  var d;

  if(keys == null) keys = ['textContent' in obj ? 'textContent' : 'value'];
  else if(typeof keys == 'string') keys = [keys];

  if(typeof setter == 'function') setter = {set: setter};
  setter = setter || defaultSetter;

  d = this.watch(pipe,obj,keys,setter);
  if(Setter.is(obj) && keys.length == 1 && keys[0] == 'value') obj.getter.frozen().listen(d.detach,[],d);
  return d;
};

function pipe(v,ov,d,obj,keys,setter){
  var i,key;

  for(i = 0;i < keys.length - 1;i++) obj = obj[keys[i]] || {};
  key = keys[i];

  if(v !== setter.ignoredValue) try{ setter.set(obj,key,v); }catch(e){}
}
