var Getter = require('./Getter'),
    parent = Symbol(),
    detachers = Symbol();

class ChildGetter extends Getter{

  constructor(p, ...d){
    super();
    this[parent] = p;
    this[detachers] = d;
  }

  get value(){
    return this[parent].value;
  }

  touched(){
    return this[parent].touched();
  }

  frozen(){
    var Resolver = require('y-resolver');
    return Resolver.race([this[parent].frozen(), ...this[detachers]]);
  }

}

/*/ exports /*/

module.exports = ChildGetter;
