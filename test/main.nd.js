var t = require('u-test'),
    Cb = require('y-callback/all'),
    assert = require('assert'),
    Resolver = require('y-resolver'),
    wait = require('y-timers/wait'),
    walk = require('y-walk'),
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

  assert.strictEqual(setter.value,getter.get());
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

t('\'observe\' works',function*(){
  var setter = new Setter(5),
      n = 0,
      lv = 5,
      extra;

  setter.getter.observe(5,function(v,ov,d,x){
    extra = x;
    lv = v;
    n++;
  },'foo');

  setter.value = 5;
  assert.strictEqual(n,0);
  assert.strictEqual(lv,5);

  setter.value = 6;
  assert.strictEqual(n,1);
  assert.strictEqual(lv,6);
  assert.strictEqual(extra,'foo');

  setter = new Setter(6);
  n = 0;
  lv = 5;

  setter.getter.observe(5,function(v,ov){
    lv = v;
    n++;
  });

  setter.value = 5;
  assert.strictEqual(n,2);
  assert.strictEqual(lv,5);

  setter.value = 6;
  assert.strictEqual(n,3);
  assert.strictEqual(lv,6);
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

t('run',function(){
  var setter = new Setter([1,2,3]),
      getter = setter.getter.run('filter',n => n > 1);

  assert.deepStrictEqual(getter.value,[2,3]);
  setter.value = [1,1,1,0,1,5,6,0,1,7];
  assert.deepStrictEqual(getter.value,[5,6,7]);
});

t('call',function(){
  var setter = new Setter(function(v1,v2){ return v1 + v2; }),
      getter = setter.getter.call(1,2);

  assert.strictEqual(getter.value,3);
  setter.value = function(v1,v2){ return v1 - v2; };
  assert.strictEqual(getter.value,-1);
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

  t('mb',function(){
    var h = new Hybrid(0);

    assert.strictEqual(h.mb(5).value,0);
    assert.strictEqual(h.mb(0).value,0);

    h.value = 2;
    assert.strictEqual(h.mb(5).value,10);
    assert.strictEqual(h.mb(0).value,0);

    h.value = 1;
    assert.strictEqual(h.mb(5).value,5);
    assert.strictEqual(h.mb(0).value,0);
  });

  t('db',function(){
    var h = new Hybrid(6);

    assert.strictEqual(h.db(2).value,3);
    assert.strictEqual(h.db(3).value,2);
  });

  t('pl',function(){
    var h = new Hybrid(6);

    assert.strictEqual(h.pl(2).value,8);
    assert.strictEqual(h.pl(3).value,9);
  });

  t('mn',function(){
    var h = new Hybrid(6);

    assert.strictEqual(h.mn(2).value,4);
    assert.strictEqual(h.mn(3).value,3);
  });

});

t('One-argument constructor',function(){
  var getter = Getter(5);

  assert.strictEqual(getter.value,5);
  assert(!getter.touched().done);

  getter = new Getter('foo');
  assert.strictEqual(getter.value,'foo');
  assert(!getter.touched().done);
});

t('Yielded getter',function(){
  var setter = new Setter(),
      getter = setter.getter,
      ok = false;

  walk(function*(){
    yield getter.is(5);
    ok = true;
  });

  setter.set(0);
  assert(!ok);
  setter.set('foo');
  assert(!ok);
  setter.set(5);
  assert(ok);

});

t('"freeze" and "frozen"',function(){
  var h = new Hybrid(),
      g,s1,s2,joined;

  h.value = 'foo';
  assert.strictEqual(h.value,'foo');
  assert(!h.frozen().done);

  h = new Hybrid();
  h.value = 'foo';
  h.freeze();

  h.value = 'bar';
  assert.strictEqual(h.value,'foo');
  assert(h.frozen().done);

  g = new Getter(() => 5,() => (new Resolver()).yielded,() => Resolver.accept());
  assert(g.frozen().done);
  assert(!g.touched().done);
  assert.strictEqual(g.value,5);

  g = new Getter(() => 5,() => (new Resolver()).yielded);
  assert(!g.frozen().done);
  assert(!g.touched().done);
  assert.strictEqual(g.value,5);

  s1 = new Setter(0);
  s2 = new Setter(1);
  joined = s1.getter.pl(s2.getter).pl(2);

  assert.strictEqual(joined.value,3);
  assert(!joined.frozen().done);
  s1.value = 2;
  assert.strictEqual(joined.value,5);
  s1.freeze();
  s1.value = 1;
  assert(!joined.frozen().done);
  assert.strictEqual(joined.value,5);
  s2.freeze();
  assert(joined.frozen().done);
  assert.strictEqual(joined.value,5);
});
