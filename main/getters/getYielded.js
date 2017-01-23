var Resolver = require('y-resolver'),
    yielded = Symbol();

module.exports = function(yd){
  var res;

  if(yd[yielded]) return yd[yielded];
  res = new Resolver();
  yd.listen(res.accept,[],res);
  return yd[yielded] = res.yielded;
};
