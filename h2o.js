
function h2o(obj){
  var ret = {},
      key;

  for(key of Object.keys(obj)){
    if(obj[key] && obj[key].constructor == Object) ret[key] = h2o(obj[key]);
    else ret[key] = obj[key].value;
  }

  return ret;
}

/*/ exports /*/

module.exports = h2o;
