var walk = require('y-walk');

module.exports = walk.wrap(function*(cb,args,that){
  try{ yield walk(cb,args,that); }
  catch(e){ setTimeout(throwError,0,e); }
});

function throwError(e){
  throw e;
}
