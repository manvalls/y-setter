var Detacher = require('detacher'),
    walk = require('y-walk'),
    pause = require('./pause'),
    same = require('./same'),
    call = require('./call'),
    frozen = require('../../getters/frozen'),
    touched = require('../../getters/touched');

function watch(getters,cb){
  var args = [],
      dArgs = [],
      d = new Detacher(pause,dArgs),
      i;

  for(i = 2;i < arguments.length;i++) args.push(arguments[i]);
  walk(loop,[args,d,cb,getters,dArgs]);
  frozen(getters).add(d);
  return d;
}

function* loop(args,d,cb,getters,dArgs){
  var ov,v,yd,update,getter;

  dArgs[0] = this;

  v = [];
  ov = [];

  for(getter of getters){
    v.push(getter.value);
    ov.push(undefined);
  }

  yd = touched(getters);
  yield call(cb,[...v,...ov,d,...args],getters[0]);
  ov = v;

  while(true){
    update = yield yd;

    v = [];
    for(getter of getters) v.push(getter.value);

    yd = touched(getters);
    if(update || !same(v,ov)) yield call(cb,[...v,...ov,d,...args],getters[0]);
    ov = v;
  }

}

/*/ exports /*/

module.exports = watch;
