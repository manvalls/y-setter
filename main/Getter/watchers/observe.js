var Detacher = require('detacher'),
    walk = require('y-walk'),
    pause = require('./pause'),
    same = require('./same'),
    call = require('./call'),
    frozen = require('../../getters/frozen'),
    touched = require('../../getters/touched');

function observe(getters,ov,cb){
  var args = [],
      dArgs = [],
      d = new Detacher(pause,dArgs),
      i;

  for(i = 3;i < arguments.length;i++) args.push(arguments[i])
  walk(loop,[args,d,cb,ov,getters,dArgs]);
  frozen(getters).add(d);
  return d;
}

function* loop(args,d,cb,ov,getters,dArgs){
  var v,yd,getter,update;

  dArgs[0] = this;
  while(true){
    v = [];
    for(getter of getters) v.push(getter.value);

    yd = touched(getters);

    if(update || !same(v,ov)) yield call(cb,[...v,...ov,d,...args],getters[0]);
    ov = v;

    update = yield yd;
  }

}

/*/ exports /*/

module.exports = observe;
