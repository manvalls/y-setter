var Setter = require('./main');

function o2h(obj,Constructor){
  var ret = {},
      key;

  Constructor = Constructor || Setter.Hybrid;
  for(key of Object.keys(obj)){
    if(obj[key] && obj[key].constructor == Object) ret[key] = o2h(obj[key]);
    else{
      ret[key] = new Constructor();
      ret[key].value = obj[key];
    }
  }

  return ret;
}

/*/ exports /*/

module.exports = o2h;
