var Getter = require('./main').Getter;

function concat(){
  return Getter.transform(arguments,concatTf);
}

function concatTf(){
  var result = '',
      i;

  for(i = 0;i < arguments.length;i++) result += arguments[i];
  return result;
}

/*/ exports /*/

module.exports = concat;
