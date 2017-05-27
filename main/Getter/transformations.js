
exports.equal = (v1, v2) => v1 == v2;
exports.notEqual = (v1, v2) => v1 != v2;
exports.strictEqual = (v1,v2) => v1 === v2;
exports.strictNotEqual = (v1,v2) => v1 !== v2;

exports.invert = (v) => !v;
exports.type = (v) => typeof v;

exports.lt = (v1,v2) => v1 < v2;
exports.le = (v1,v2) => v1 <= v2;
exports.gt = (v1,v2) => v1 > v2;
exports.ge = (v1,v2) => v1 >= v2;

exports.add = (v1,v2) => v1 + v2;
exports.substract = (v1,v2) => v1 - v2;
exports.multiplyBy = (v1,v2) => v1 * v2;
exports.divideBy = (v1,v2) => v1 / v2;

exports.iif = (v,vt,vf) => v ? vt : vf;
exports.and = (v1,v2) => v1 && v2;
exports.or = (v1,v2) => v1 || v2;

exports.isA = (v1,v2) => v1 instanceof v2;
exports.isNotA = (v1,v2) => !(v1 instanceof v2);

exports.math = function(){
  var args = [],
      method,i;

  args.push(arguments[0]);
  method = arguments[1];
  for(i = 2;i < arguments.length;i++) args.push(arguments[i]);
  return Math[method](...args);
};

exports.get = function(){
  var obj = arguments[0],
      i;

  for(i = 1;i < arguments.length;i++){
    if(obj == null) obj = {};
    obj = obj[arguments[i]];
  }

  return obj;
};

exports.run = function(){
  var obj = arguments[0],
      func = obj[arguments[1]],
      args = [],
      i;

  for(i = 2;i < arguments.length;i++) args.push(arguments[i]);
  return func.apply(obj,args);
};

exports.call = function(){
  var func = arguments[0],
      args = [],
      i;

  for(i = 1;i < arguments.length;i++) args.push(arguments[i]);
  return func.apply(this,args);
};

exports.resc = function(v){
  return (v + '').replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};
