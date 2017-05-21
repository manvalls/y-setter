var Detacher = require('detacher'),
    walk = require('y-walk'),
    pause = require('./pause'),
    same = require('./same'),
    call = require('./call'),
    frozen = require('../../getters/frozen'),
    touched = require('../../getters/touched');

function glance(getters,cb){
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
  var ov,v,update,getter;

  dArgs[0] = this;

  v = [];
  ov = [];

  for(getter of getters){
    v.push(getter.value);
    ov.push(undefined);
  }

  yield call(cb,[...v,...ov,d,...args],getters[0]);

  ov = [];
  for(getter of getters) ov.push(getter.value);

  while(true){
    update = yield touched(getters);

    v = [];
    for(getter of getters) v.push(getter.value);
    if(update || !same(v,ov)) yield call(cb,[...v,...ov,d,...args],getters[0]);

    ov = [];
    for(getter of getters) ov.push(getter.value);
  }

}

/*/ exports /*/

module.exports = glance;
