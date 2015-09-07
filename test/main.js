var t = require('u-test'),
    Cb = require('y-callback/all'),
    assert = require('assert'),
    Setter = require('../main.js');

t('Basic',function(){
  var setter = new Setter(),
      getter = setter.getter;

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
      var dest = getter.to(function(n){ return Math.floor(n + 1); });

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

    t('Multiple hybrids',function(){
      var h1 = new Setter.Hybrid(),
          h2 = new Setter.Hybrid(),
          dest = getter.to(h1,h2,function(v,v1,v2){ return Math.floor(v + v1 + v2); });

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

  t('Watch works',function*(){
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

});
