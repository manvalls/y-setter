var t = require('u-test'),
    Cb = require('y-callback/all'),
    assert = require('assert'),
    Resolver = require('y-resolver'),
    wait = require('y-timers/wait'),
    walk = require('y-walk'),
    Setter = require('../main'),
    o2h = require('../o2h.js'),
    h2o = require('../h2o.js'),
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
  var o1 = new Setter(),
      o2 = {textContent: null},
      o3 = {foo: {bar: 'baz'}},
      d;

  t('Multiple keys',function(){
    d = getter.connect(o3,['foo','bar']);
    assert.strictEqual(o3.foo.bar,getter.value);

    setter.value = {};
    assert.strictEqual(o3.foo.bar,getter.value);

    d.detach();
    setter.value = {};
    assert.notEqual(o1.value,getter.value);
  });

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

    d.detach();
    setter.value = {};
    assert.notEqual(o2.textContent,getter.value);
  });

  t('Custom property',function(){
    d = getter.connect(o1,'foo');
    assert.strictEqual(o1.foo,getter.value);
    setter.value = {};
    assert.strictEqual(o1.foo,getter.value);

    d.detach();
    setter.value = {};
    assert.notEqual(o1.foo,getter.value);
  });

});

t('\'pipe\' works',function(){
  var o1 = new Setter(),
      o2 = {textContent: null},
      o3 = {foo: {bar: 'baz'}},
      d;

  t('Multiple keys',function(){
    var obj;

    d = getter.pipe(o3,['foo','bar']);
    assert.strictEqual(o3.foo.bar,getter.value);

    setter.value = obj = {};
    assert.strictEqual(o3.foo.bar,getter.value);
    setter.value = undefined;
    assert.strictEqual(o3.foo.bar,obj);

    d.detach();
    setter.value = {};
    assert.notEqual(o1.value,getter.value);
  });

  t('Default property, object with no \'textContent\'',function(){
    var obj;

    d = getter.pipe(o1);
    assert.strictEqual(o1.value,getter.value);

    setter.value = obj = {};
    assert.strictEqual(o1.value,getter.value);
    setter.value = undefined;
    assert.strictEqual(o1.value,obj);

    d.detach();
    setter.value = {};
    assert.notEqual(o1.value,getter.value);
  });

  t('Default property, object with \'textContent\'',function(){
    var obj;

    d = getter.pipe(o2);
    assert.strictEqual(o2.textContent,getter.value);

    setter.value = obj = {};
    assert.strictEqual(o2.textContent,getter.value);
    setter.value = undefined;
    assert.strictEqual(o2.textContent,obj);

    d.detach();
    setter.value = {};
    assert.notEqual(o2.textContent,getter.value);
  });

  t('Custom property',function(){
    var obj;

    d = getter.pipe(o1,'foo');
    assert.strictEqual(o1.foo,getter.value);

    setter.value = obj = {};
    assert.strictEqual(o1.foo,getter.value);
    setter.value = undefined;
    assert.strictEqual(o1.foo,obj);

    d.detach();
    setter.value = {};
    assert.notEqual(o1.foo,getter.value);
  });

});

t('\'to\' works',function(){

  t('Single getter',function(){
    var dest = getter.map(function(n){ return Math.floor(n + 1); });

    t('Value propagates',function(){
      setter.value = 0;
      assert.strictEqual(dest.value,1);
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
        res = new Resolver(),
        dest = getter.to((v,v1,v2,s,yd) => Math.floor(v + v1 + v2 + s + (yd || 0)),h1,h2,0,res.yielded);

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

      yd = dest.touched();
      assert(!yd.done);
      res.accept(1);
      assert(yd.done);
      assert.strictEqual(dest.value,Math.floor(getter.value + h1.value + h2.value + 1));

    });

    t('Watch works',function*(){
      var ok = true,
          cb,d;

      d = dest.watch(cb = Cb(function(v){
        assert(ok);
        assert.strictEqual(v,dest.value);
        assert.strictEqual(v,Math.floor(getter.value + h1.value + h2.value + (res.yielded.value || 0)));
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
  var setter = new Hybrid(),
      getter = setter.getter,
      foo = setter.get('foo','foo'),
      yd;

  assert.strictEqual(setter.setter['3asKNsYzcdGduft'], 55);
  assert.strictEqual(setter.getter['3asKNsYzcdGduft'], 54);
  assert.strictEqual(setter['3asKNsYzcdGduft'], 56);

  setter.value = {foo: {foo: 'bar'}};
  assert.strictEqual(foo.value,'bar');

  yd = foo.touched();
  assert.strictEqual(yd.done,false);

  setter.set({foo: {foo: 'foo'}});
  assert.strictEqual(yd.done,true);
  assert.strictEqual(foo.value,'foo');

  yd = getter.touched();
  foo.touch();
  assert(yd.done);

  yd = getter.touched();
  foo.setter.value = 'bar';

  assert.strictEqual(foo.value,'bar');
  assert.strictEqual(setter.value.foo.foo,'bar');
  assert.strictEqual(yd.value,true);

  setter.value = {foo: 5};
  assert.strictEqual(foo.value,undefined);
  setter.value = {bar: 5};
  assert.strictEqual(foo.value,undefined);

  foo.freeze();
  assert(foo.frozen().done);

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

t('\'throttle\' works',function*(){
  var setter = new Setter(),
      getter = setter.getter.throttle(0),
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

  setter = new Setter();
  getter = setter.getter.throttle(100);
  getter.watch(v => (n++,value = v));
  n = 0;

  setter.value = 1;
  yield wait(0);
  assert.strictEqual(n,1);
  assert.strictEqual(value,1);
  setter.value = 2;
  yield wait(0);
  assert.strictEqual(n,1);
  assert.strictEqual(value,1);
  yield wait(150);
  assert.strictEqual(n,2);
  assert.strictEqual(value,2);
  setter.value = 1;
  yield wait(50);
  assert.strictEqual(n,3);
  assert.strictEqual(value,1);

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

t('\'precision\' works',function*(){
  var setter = new Hybrid(),
      getter = setter.precision(2),
      n,value;

  getter.watch(v => (n++,value = v));
  n = 0;

  setter.value = 1;
  setter.value = 2;
  setter.value = 3;

  assert.strictEqual(n,2);
  assert.strictEqual(value,3);
});

t('valueOf',function(){
  var h1 = new Hybrid(1),
      h2 = new Hybrid(2),
      s = new Setter(3),
      g = s.getter;

  assert.strictEqual(h1 + h2 + s + g,9);
});

t('concat',function(){
  var h1 = new Hybrid(new Setter(1)),
      h2 = new Hybrid(3),
      c = require('../concat')(h1,2,h2);

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
    assert(h.isNull.value);
    assert(h.is(undefined).value);

    h.value = 5;
    assert(h.isNotNull.value);
    assert(h.void.isNull.value);
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

  t('readonly',function(){
    var h = new Hybrid(undefined),
        ro;

    assert(h.writable);
    assert(!h.readonly.writable);
    h.value = true;
    assert(h.value);
    ro = h.readonly;
    ro.value = false;
    assert(ro.value);
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

  t('math',function(){
    var h = new Hybrid(4);

    assert.strictEqual(h.math('sqrt').value,2);
    assert.strictEqual(h.math('max',500).value,500);
    assert.strictEqual(h.math('min',500).value,4);
  });

});

t('One-argument constructor',function(){
  var getter = new Getter(5);

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

t('"freeze" and "frozen"',function*(){
  var h = new Hybrid(),
      g,s1,s2,joined,res,t;

  h.value = 'foo';
  assert.strictEqual(h.value,'foo');
  assert(!h.frozen().done);

  h = new Hybrid();
  h.value = 'foo';
  h.freeze();

  h.value = 'bar';
  assert.strictEqual(h.value,'foo');
  assert(h.frozen().done);

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

  res = new Resolver();
  h = new Hybrid(res.yielded);
  h.value = 'foo';
  res.accept();
  t = h.touched();
  h.value = 'bar';
  yield h.frozen();

  assert.strictEqual(t.done,false);
  assert.strictEqual(h.value,'foo');

  res = new Resolver();
  h = new Hybrid(res.yielded);
  h.value = 'foo';
  h.freeze();
  t = h.touched();
  h.value = 'bar';
  yield h.frozen();

  assert.strictEqual(t.done,false);
  assert.strictEqual(h.value,'foo');

});

t('Delegation',function*(){
  var ds = new Hybrid(0),
      ss = new Hybrid(1),
      setter = new Setter(ds,ss.getter),
      yd;

  assert.strictEqual(setter.value,1);
  ss.value = 2;
  assert.strictEqual(setter.value,2);
  setter.value = 5;
  assert.strictEqual(ds.value,5);

  yd = ds.getter.touched();
  setter.touch();
  yield yd;

  yd = ds.getter.touched();
  setter.update();
  assert(yield yd);

  setter.freeze();
  yield ds.getter.frozen();

});

t('o2h & h2o',function(){
  var obj = o2h({
    foo: 'bar',
    obj: {
      answer: 42
    }
  });

  assert.strictEqual(obj.foo.constructor,Setter.Hybrid);
  assert.strictEqual(obj.foo.value,'bar');
  assert.strictEqual(obj.obj.answer.constructor,Setter.Hybrid);
  assert.strictEqual(obj.obj.answer.value,42);

  obj = h2o(obj);
  assert.strictEqual(obj.foo,'bar');
  assert.strictEqual(obj.obj.answer,42);
});

t('setter.update()',function(){
  var setter = new Hybrid(),
      n = 0;

  setter.update();
  setter.getter.watch(() => n++);
  assert.strictEqual(n,1);
  setter.update();
  assert.strictEqual(n,2);
});

t('Well-known symbols',function(){

  t('Symbol.iterator',function(){
    var setter = new Hybrid();

    setter.value = [1,2,3];
    assert.deepStrictEqual(Array.from(setter.getter),setter.getter.value);

    setter.value = null;
    assert.deepStrictEqual(Array.from(setter.getter),[]);

    setter.value = {};
    assert.deepStrictEqual(Array.from(setter.getter),[]);
  });

});

t('Getter.get()',function*(){
  var g,setter;

  g = Getter.get(5);
  assert.strictEqual(g.value,5);
  yield g.frozen();

  setter = new Setter();
  g = Getter.get(setter);
  setter.value = 5;
  assert.strictEqual(g.value,5);

  setter = new Setter();
  g = Getter.get(setter.getter);
  setter.value = 5;
  assert.strictEqual(g.value,5);

});
