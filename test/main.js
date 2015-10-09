var t = require('u-test'),
    Cb = require('y-callback/all'),
    assert = require('assert'),
    Resolver = require('y-resolver'),
    wait = require('y-timers/wait'),
    Setter = require('../main.js'),
    Getter = Setter.Getter,
    Hybrid = Setter.Hybrid,

    setter = new Setter(),
    getter = setter.getter;

assert(Getter.is(getter));
assert(Setter.is(setter));

t('Value propagates from setter to getter',function(){
  var values = ['foo',5,{},Symbol()],
      i;

  for(i = 0;i < values.length;i++){
    assert.strictEqual(setter.value,getter.value);
    setter.value = values[i];
  }

  assert.strictEqual(setter.value,getter.value);
});

t('Setter is writable',function(){
  var obj = {};

  assert(setter.writable);
  setter.value = obj;
  assert.equal(setter.value,obj);
});

t('Getter is not writable',function(){
  var v;

  assert(!getter.writable);
  v = getter.value;
  getter.value = {};
  assert.strictEqual(getter.value,v);
});

t('\'touched\' works',function(){
  var yd;

  setter.value = 0;
  yd = getter.touched();
  setter.value = 0;
  assert(!yd.done);
  setter.value = 1;
  assert(yd.done);

});

t('\'connect\' works',function(){
  var o1 = {},
      o2 = {textContent: null},
      d;

  t('Default property, object with no \'textContent\'',function(){
    d = getter.connect(o1);
    assert.strictEqual(o1.value,getter.value);
    setter.value = {};

    assert.strictEqual(o1.value,getter.value);
    d.detach();
    setter.value = {};
    assert.notEqual(o1.value,getter.value);
  });

  t('Default property, object with \'textContent\'',function(){
    d = getter.connect(o2);
    assert.strictEqual(o2.textContent,getter.value);
    setter.value = {};
    assert.strictEqual(o2.textContent,getter.value);

    assert.strictEqual(o2.textContent,getter.value);
    d.detach();
    setter.value = {};
    assert.notEqual(o2.textContent,getter.value);
  });

  t('Custom property',function(){
    d = getter.connect(o1,'foo');
    assert.strictEqual(o1.foo,getter.value);
    setter.value = {};
    assert.strictEqual(o1.foo,getter.value);

    assert.strictEqual(o1.foo,getter.value);
    d.detach();
    setter.value = {};
    assert.notEqual(o1.foo,getter.value);
  });

});

t('\'to\' works',function(){

  t('Single getter',function(){
    var obj = {},
        dest = getter.to(function(n){ return that = this,Math.floor(n + 1); },obj),
        that;

    t('Value propagates',function(){
      setter.value = 0;
      assert.strictEqual(dest.value,1);
      assert.strictEqual(that,obj);
    });

    t('\'touched\' works',function*(){
      var yd;

      setter.value = 0;
      yd = dest.touched();
      setter.value = 0;
      assert(!yd.done);
      setter.value = 1;
      assert(yd.done);

    });

    t('Watch works',function*(){
      var ok = true,
          cb,d;

      d = dest.watch(cb = Cb(function(v){
        assert(ok);
        assert.strictEqual(v,dest.value);
        assert.strictEqual(v,Math.floor(getter.value + 1));
        ok = false;
      }));

      ok = false;
      setter.value = setter.value + 0.01;

      ok = true;
      setter.value = 3;
      yield cb;

      d.detach();
    });

  });

  t('Multiple hybrids/non-getters',function(){
    var h1 = new Setter.Hybrid(),
        h2 = new Setter.Hybrid(),
        dest = getter.to(h1,h2,0,function(v,v1,v2,s){ return Math.floor(v + v1 + v2 + s); });

    t('Value propagates',function(){
      setter.value = 0;
      h1.value = 1;
      h2.value = 2;
      assert.strictEqual(dest.value,3);
    });

    t('\'touched\' works',function*(){
      var yd;

      setter.value = 0;
      yd = dest.touched();
      setter.value = 0;
      assert(!yd.done);
      setter.value = 1;
      assert(yd.done);

      h1.value = 0;
      yd = dest.touched();
      h1.value = 0;
      assert(!yd.done);
      h1.value = 1;
      assert(yd.done);

      h2.value = 0;
      yd = dest.touched();
      h2.value = 0;
      assert(!yd.done);
      h2.value = 1;
      assert(yd.done);

    });

    t('Watch works',function*(){
      var ok = true,
          cb,d;

      d = dest.watch(cb = Cb(function(v){
        assert(ok);
        assert.strictEqual(v,dest.value);
        assert.strictEqual(v,Math.floor(getter.value + h1.value + h2.value));
        ok = false;
      }));

      ok = false;
      setter.value = setter.value + 0.01;

      ok = true;
      setter.value = 3;
      yield cb;

      ok = true;
      h1.value = 50;
      yield cb;

      ok = true;
      h2.value = 50;
      yield cb;

      d.detach();
    });

  });

});

t('\'get\' works',function(){
  var setter = new Setter(),
      getter = setter.getter,
      foo = getter.get('foo','foo'),
      yd;

  setter.value = {foo: {foo: 'bar'}};
  assert.strictEqual(foo.value,'bar');

  yd = foo.touched();
  assert.strictEqual(yd.done,false);

  setter.value = {foo: {foo: 'foo'}};
  assert.strictEqual(yd.done,true);
  assert.strictEqual(foo.value,'foo');
});

t('\'watch\' works',function*(){
  var ok = true,
      d,cb;

  d = getter.watch(cb = Cb(function(v,ov){
    assert(ok);
    assert.notStrictEqual(v,ov);
    assert.strictEqual(v,getter.value);
    ok = false;
  }));

  setter.value = setter.value;
  setter.value = getter.value;
  ok = !ok;
  setter.value = 15;
  ok = !ok;
  setter.value = 30;

  yield cb;
});

t('watch vs glance',function*(){
  var setter = new Setter(0),
      getter = setter.getter,
      obj = {},
      g,cb,conn,lv;

  conn = getter.watch(cb = Cb(function(v){
    if(v < 5) setter.value++;
  }));

  assert.strictEqual(getter.value,5);
  yield cb;
  conn.detach();
  conn = null;
  setter.value = 0;

  conn = getter.glance(cb = Cb(function(v,ov,c,o){
    assert.strictEqual(o,obj);
    if(conn) assert.strictEqual(c,conn);
    if(v < 5){
      assert.strictEqual(lv,ov);
      setter.value++;
    }
  }),obj);

  assert.strictEqual(getter.value,1);
  lv = getter.value;
  setter.value = 1;
  assert.strictEqual(getter.value,1);
  lv = getter.value;
  setter.value = 2;
  assert.strictEqual(getter.value,3);
  yield cb;
  conn.detach();
  setter.value = 0;

  (g = getter.to( v => parseInt(v) )).glance(cb = Cb(function(v){
    if(v < 5) setter.value++;
  }));

  assert.strictEqual(g.value,1);
  setter.value = '1';
  assert.strictEqual(g.value,1);
  setter.value = 2;
  assert.strictEqual(g.value,3);
  yield cb;

});

t('\'debounce\' works',function*(){
  var setter = new Setter(),
      getter = setter.getter.debounce(0),
      n,value;

  getter.watch(v => (n++,value = v));
  getter.watch(v => (n++,value = v));
  n = 0;

  setter.value = 1;
  setter.value = 2;
  setter.value = 3;

  yield wait(10);
  assert.strictEqual(n,2);
  assert.strictEqual(value,3);
});

t('Getter constructor',function(){
  var yd = (new Resolver()).yielded,
      n = 0,
      g = new Setter.Getter(
        function(){ return n = n + 1; },
        function(){ return yd; }
      ),
      tc,v;

  tc = g.touched();
  assert.notStrictEqual(g.value,g.value);
  assert(!tc.done);

});

t('valueOf',function(){
  var h1 = new Hybrid(1),
      h2 = new Hybrid(2),
      s = new Setter(3),
      g = s.getter;

  assert.strictEqual(h1 + h2 + s + g,9);
});

t('concat',function(){
  var h1 = new Hybrid(1),
      h2 = new Hybrid(3),
      c = Getter.concat(h1,2,h2);

  assert.strictEqual(c.value,'123');
  h1.value = '0';
  assert.strictEqual(c.value,'023');
  h2.value = 4;
  assert.strictEqual(c.value,'024');
});

t('Simple transformers',function(){

  t('is',function(){
    var h = new Hybrid(undefined);

    assert(h.is(null).value);
    assert(h.is(undefined).value);

    h.value = 5;
    assert(h.is(5).value);
    assert(h.is('5').value);
  });

  t('isNot',function(){
    var h = new Hybrid(undefined);

    assert(h.isNot(true).value);
    assert(h.isNot(false).value);

    h.value = 5;
    assert(h.isNot(4).value);
    assert(h.isNot('4').value);
  });

  t('equals',function(){
    var h = new Hybrid(undefined);

    assert(!h.equals(null).value);
    assert(h.equals(undefined).value);

    h.value = 5;
    assert(h.equals(5).value);
    assert(!h.equals('5').value);
  });

  t('equalsNot',function(){
    var h = new Hybrid(undefined);

    assert(h.equalsNot(null).value);
    assert(!h.equalsNot(undefined).value);

    h.value = 5;
    assert(!h.equalsNot(5).value);
    assert(h.equalsNot('5').value);
  });

  t('type',function(){
    var h = new Hybrid(undefined);

    assert.strictEqual(h.type.value,'undefined');

    h.value = 5;
    assert.strictEqual(h.type.value,'number');
  });

  t('not',function(){
    var h = new Hybrid(undefined);

    assert(h.not.value);
    h.value = true;
    assert(!h.not.value);
  });

  t('gt',function(){
    var h = new Hybrid(undefined);

    assert(!h.gt(0).value);
    assert(!h.gt(undefined).value);

    h.value = 5;
    assert(h.gt(4).value);
    assert(!h.gt(5).value);
    assert(!h.gt(6).value);
  });

  t('ge',function(){
    var h = new Hybrid(undefined);

    assert(!h.ge(0).value);
    assert(!h.ge(undefined).value);

    h.value = 5;
    assert(h.ge(4).value);
    assert(h.ge(5).value);
    assert(!h.ge(6).value);
  });

  t('lt',function(){
    var h = new Hybrid(undefined);

    assert(!h.lt(0).value);
    assert(!h.lt(undefined).value);

    h.value = 5;
    assert(!h.lt(4).value);
    assert(!h.lt(5).value);
    assert(h.lt(6).value);
  });

  t('le',function(){
    var h = new Hybrid(undefined);

    assert(!h.le(0).value);
    assert(!h.le(undefined).value);

    h.value = 5;
    assert(!h.le(4).value);
    assert(h.le(5).value);
    assert(h.le(6).value);
  });

  t('iif',function(){
    var h = new Hybrid(undefined);

    assert.strictEqual(h.iif('foo','bar').value,'bar');
    assert.strictEqual(h.not.iif('foo','bar').value,'foo');

    h.value = true;
    assert.strictEqual(h.not.iif('foo','bar').value,'bar');
    assert.strictEqual(h.iif('foo','bar').value,'foo');
  });

  t('and',function(){
    var h = new Hybrid(undefined);

    assert(!h.and(true).value);
    assert(!h.and(false).value);

    h.value = true;
    assert(h.and(true).value);
    assert(!h.and(false).value);
  });

  t('or',function(){
    var h = new Hybrid(undefined);

    assert(h.or(true).value);
    assert(!h.or(false).value);

    h.value = true;
    assert(h.or(true).value);
    assert(h.or(false).value);
  });

  t('isA / isAn',function(){
    var h = new Hybrid([]);

    assert(h.isAn(Array).value);
    assert(h.isNotA(Date).value);

    h.value = new Date();
    assert(h.isNotAn(Array).value);
    assert(h.isA(Date).value);
  });

});
