/*global bean:true, qwery:true, buster:true, Syn:true, assert:true, defer:true, features:true, globalSetUp:true, globalTearDown:true*/

buster.testCase('custom types', {
    'setUp': function () {
      var self = this

      globalSetUp.call(this)

      this.testRemove = function (done, removeFn) {
        var html    = document.documentElement
          , foo     = this.byId('foo')
          , trigger = self.trigger()
          , meSpy   = self.spy()
          , mlSpy   = self.spy()

        trigger.after(function () {
          assert.equals(meSpy.callCount, 1, 'removes mouseenter event')
          assert.equals(mlSpy.callCount, 1, 'removes mouseleave event')
          done()
        })

        bean.add(foo, 'mouseenter', trigger.wrap(meSpy))
        bean.add(foo, 'mouseleave', trigger.wrap(mlSpy))

        Syn.trigger('mouseover', { relatedTarget: html }, foo)
        Syn.trigger('mouseout', { relatedTarget: html }, foo)

        removeFn(foo, trigger.wrapped(meSpy), trigger.wrapped(mlSpy))

        Syn.trigger('mouseover', { relatedTarget: html }, foo)
        Syn.trigger('mouseout', { relatedTarget: html }, foo)
      }
    }

  , 'tearDown': globalTearDown

  , 'mouseenter/mouseleave should wrap simple mouseover/mouseout': function (done) {
      var html    = document.documentElement
        , foo     = this.byId('foo')
        , bar     = this.byId('bar')
        , bang    = this.byId('bang')
        , trigger = this.trigger()
        , meSpy   = this.spy()
        , mlSpy   = this.spy()

      trigger.after(function () {
        assert.equals(meSpy.callCount, 1, 'removes mouseenter event')
        assert.equals(mlSpy.callCount, 1, 'removes mouseleave event')
        assert(meSpy.firstCall.args[0], 'has event object argument')
        assert(mlSpy.firstCall.args[0], 'has event object argument')
        assert.same(meSpy.firstCall.args[0].currentTarget, foo, 'currentTarget property of event set correctly')
        assert.same(mlSpy.firstCall.args[0].currentTarget, foo, 'currentTarget property of event set correctly')
        done()
      }, 50)

      bean.add(foo, 'mouseenter', trigger.wrap(meSpy))
      bean.add(foo, 'mouseleave', trigger.wrap(mlSpy))

      // relatedTarget is where the mouse came from for mouseover and where it's going to in mouseout
      Syn.trigger('mouseover', { relatedTarget: html }, foo)
      Syn.trigger('mouseover', { relatedTarget: foo } , bar)
      Syn.trigger('mouseover', { relatedTarget: bar } , bang)
      Syn.trigger('mouseout' , { relatedTarget: bar } , bang)
      Syn.trigger('mouseout' , { relatedTarget: foo } , bar)
      Syn.trigger('mouseout' , { relatedTarget: html }, foo)
    }

  , 'custom events should be removable': function (done) {
      this.testRemove(done, function (foo, me, ml) {
        bean.remove(foo)
      })
    }

  , 'custom events should be removable by type': function (done) {
      this.testRemove(done, function (foo, me, ml) {
        bean.remove(foo, 'mouseenter')
        bean.remove(foo, 'mouseleave')
      })
    }

  , 'custom events should be removable by type+handler': function (done) {
      this.testRemove(done, function (foo, me, ml) {
        bean.remove(foo, 'mouseenter', me)
        bean.remove(foo, 'mouseleave', ml)
      })
    }

  , 'custom events should work with delegate': function (done) {
      var html    = document.documentElement
        , foo     = this.byId('foo')
        , bar     = this.byId('bar')
        , bang    = this.byId('bang')
        , trigger = this.trigger()
        , meSpy   = this.spy()
        , mlSpy   = this.spy()

      trigger.after(function () {
        assert.equals(meSpy.callCount, 1, 'removes mouseenter event')
        assert.equals(mlSpy.callCount, 1, 'removes mouseleave event')
        assert(meSpy.firstCall.args[0], 'has event object argument')
        assert(mlSpy.firstCall.args[0], 'has event object argument')
        assert.same(meSpy.firstCall.args[0].currentTarget, bang, 'currentTarget property of event set correctly')
        assert.same(mlSpy.firstCall.args[0].currentTarget, bang, 'currentTarget property of event set correctly')
        done()
      }, 50)

      bean.setSelectorEngine(qwery)

      bean.add(foo, '.bang', 'mouseenter', trigger.wrap(meSpy), qwery)
      bean.add(foo, '.bang', 'mouseleave', trigger.wrap(mlSpy), qwery)

      Syn.trigger('mouseover', { relatedTarget: html }, foo)
      Syn.trigger('mouseover', { relatedTarget: foo } , bar)
      Syn.trigger('mouseover', { relatedTarget: bar } , bang)
      Syn.trigger('mouseout' , { relatedTarget: bar } , bang)
      Syn.trigger('mouseout' , { relatedTarget: foo } , bar)
      Syn.trigger('mouseout' , { relatedTarget: html }, foo)
    }
})