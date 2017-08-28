var Getter = require('./Getter'),
    ChildGetter = require('./ChildGetter'),
    isSetter = 'o5CqYkOh5ezPpwT',
    setter = Symbol(),
    getter = Symbol(),
    resolver = Symbol(),
    frozen = Symbol(),
    value = Symbol(),
    path = Symbol();

class Setter{

  static is(obj){
    return !!(obj && obj[isSetter]);
  }

  static get Decoupled(){ return DecoupledSetter; }
  static get Hybrid(){ return HybridGetter; }

  // Default behaviour

  constructor(v){
    this[getter] = new SettedGetter(v);
  }

  freeze(){
    this[getter][frozen].accept();
  }

  touch(arg){
    var r;

    arg = !!arg;
    r = this[getter][resolver];
    if(!r) return;

    delete this[getter][resolver];
    r.accept(arg);
  }

  set value(v){
    var ov;

    if(this.getter.frozen().done) return;

    ov = this[getter].value;
    this[getter][value] = v;
    if(ov !== v) this.touch();
  }

  get getter(){
    return this[getter];
  }

  // Common methods

  update(){

    if(arguments.length > 0 && !this.getter.frozen().done){
      this[getter][value] = arguments[0];
    }

    this.touch(true);

  }

  set(value){
    this.value = value;
  }

  get(){
    if(!arguments.length) return this.value;
    return new HybridGetter(new SetterWithPath(this, ...arguments));
  }

  set v(v){
    this.value = v;
  }

  get v(){
    return this.value;
  }

  get value(){
    return this.getter.value;
  }

  get [isSetter](){ return true; }

  // Useful methods

  valueOf(){
    return this.value;
  }

  get writable(){ return true; }

  get writeonly(){ return this; }

  // ebjs label

  get [Symbol.for('ebjs/label')](){ return 55; }

}

class SettedGetter extends Getter{

  constructor(v){
    var Resolver = require('y-resolver');

    super();
    this[frozen] = new Resolver();
    this[value] = v;
  }

  get value(){
    return this[value];
  }

  touched(){
    var Resolver = require('y-resolver');
    if(!this[resolver]) this[resolver] = new Resolver();
    return this[resolver].yielded;
  }

  frozen(){
    return this[frozen].yielded;
  }

}

class DecoupledSetter extends Setter{

  constructor(st, gt){
    super();
    this[setter] = st;
    this[getter] = gt;
  }

  freeze(){ this[setter].freeze(...arguments); }
  touch(){ this[setter].touch(...arguments); }

  set value(v){
    if(this.getter.frozen().done) return;
    return this[setter].value = v;
  }

  get value(){ return this.getter.value; }

}

class HybridGetter extends ChildGetter{

  constructor(st){
    super(st.getter);
    this[setter] = st;
  }

  freeze(){ return this[setter].freeze(...arguments); }
  touch(){ return this[setter].touch(...arguments); }

  set value(v){ return this[setter].value = v; }
  get value(){ return this[setter].value; }

  get getter(){ return this[setter].getter; }
  get setter(){ return this[setter]; }

  update(){ return this[setter].update(...arguments); }
  set(){ return this[setter].set(...arguments); }
  get(){ return this[setter].get(...arguments); }
  get writeonly(){ return this[setter]; }
  get [isSetter](){ return true; }

  get writable(){ return true; }
  get [Symbol.for('ebjs/label')](){ return 56; }

}

class SetterWithPath extends Setter{

  constructor(st, ...p){
    super();
    this[path] = p;
    this[setter] = st;
    this[getter] = st.getter.get(...p);
  }

  set value(v){
    var p,i,obj;

    if(this.getter.frozen().done) return;

    p = this[path];
    obj = this[setter].value;

    for(i = 0;i < p.length - 1;i++){
      if(obj == null) break;
      obj = obj[p[i]];
    }

    if(obj instanceof Object && obj[p[i]] !== v){
      obj[p[i]] = v;
      this[setter].update();
    }

  }

  get value(){ return this.getter.value; }
  freeze(){ return this[setter].freeze(...arguments); }
  touch(){ return this[setter].touch(...arguments); }

}

/*/ exports /*/

module.exports = Setter;
