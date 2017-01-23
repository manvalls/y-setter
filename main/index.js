var Setter = require('./Setter'),
    Getter = require('./Getter'),
    ChildGetter = require('./ChildGetter');

class ExportedSetter extends Setter{

  static get Getter(){ return Getter; }
  static get Hybrid(){ return ExportedHybrid; }

  constructor(st, gt){

    if(Setter.is(st) && Getter.is(gt)) return new Setter.Decoupled(st, gt);

    if(st && typeof st.then == 'function'){
      super();
      return new Setter.Decoupled(this, new ChildGetter(this.getter, st));
    }

    super(...arguments);

  }

}

class ExportedHybrid extends Setter.Hybrid{

  constructor(value){
    var s;

    if(value && Setter.is(value)) s = value;
    else s = new ExportedSetter(value);

    super(s);
  }

}

/*/ exports /*/

module.exports = ExportedSetter;
