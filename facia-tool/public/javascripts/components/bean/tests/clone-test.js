/*global bean:true, qwery:true, buster:true, Syn:true, assert:true, defer:true, features:true, globalSetUp:true, globalTearDown:true*/

buster.testCase('clone', {
    'setUp': globalSetUp
  , 'tearDown': globalTearDown

  , 'should be able to clone events of a specific type from one element to another': function (done) {
      var el1     = this.byId('input')
        , el2     = this.byId('input2')
        , trigger = this.trigger()
        , spy1    = this.spy()
        , spy2    = this.spy()
        , spy3    = this.spy()

      trigger.after(function () {
        assert.equals(spy1.callCount, 1, 'cloned first click handler')
        assert.equals(spy2.callCount, 1, 'cloned second click handler')
        assert.equals(spy3.callCount, 0, 'should not clone non-click handler')
        done()
      })

      bean.add(el2, 'click'  , trigger.wrap(spy1))
      bean.add(el2, 'click'  , trigger.wrap(spy2))
      bean.add(el2, 'keydown', trigger.wrap(spy3))

      bean.clone(el1, el2, 'click')

      Syn.click(el1)
      Syn.key('j', el1)
    }

  , 'should be able to clone all events from one element to another': function (done) {
      var el1     = this.byId('input')
        , el2     = this.byId('input2')
        , trigger = this.trigger()
        , spy1    = this.spy()
        , spy2    = this.spy()
        , spy3    = this.spy()

      trigger.after(function () {
        assert.equals(spy1.callCount, 1, 'cloned first click handler')
        assert.equals(spy2.callCount, 1, 'cloned second click handler')
        assert.equals(spy3.callCount, 1, 'cloned keydown handler')
        done()
      })

      bean.add(el2, 'click'  , trigger.wrap(spy1))
      bean.add(el2, 'click'  , trigger.wrap(spy2))
      bean.add(el2, 'keydown', trigger.wrap(spy3))

      bean.clone(el1, el2)

      Syn.click(el1)
      Syn.key('j', el1)
    }

  , 'should fire cloned event in scope of new element': function (done) {
      var el1     = this.byId('input')
        , el2     = this.byId('input2')
        , trigger = this.trigger()
        , spy     = this.spy()

      trigger.after(function () {
        assert.equals(spy.callCount, 1, 'cloned click handler')
        assert.same(spy.thisValues[0], el2, 'cloned handler gets correct context (this)')
        done()
      })

      bean.add(el1, 'click', trigger.wrap(spy))
      bean.clone(el2, el1)

      Syn.click(el2)
    }

  , 'should work with delegated events': function (done) {
      var foo     = this.createElement('div')
        , realfoo = this.byId('foo')
        , bang    = this.byId('bang')
        , trigger = this.trigger()
        , spy1    = this.spy()
        , spy2    = this.spy()

      trigger.after(function () {
        assert.equals(spy1.callCount, 1, 'cloned delegated event handler')
        assert.same(spy1.thisValues[0], bang, 'context (this) was set to delegated element')
        assert(spy1.firstCall.args[0], 'got an event object argument')
        assert.same(spy1.firstCall.args[0].currentTarget, bang, 'degated event has currentTarget property correctly set')
        assert.equals(spy2.callCount, 0, 'cloned delegated event handler retains delegation selector (should not call this)')
        done()
      })

      bean.setSelectorEngine(qwery)

      bean.add(foo, '.bang', 'click', trigger.wrap(spy1), qwery)
      bean.add(foo, '.baz' , 'click', trigger.wrap(spy2), qwery)

      bean.clone(realfoo, foo)

      Syn.click(bang)
    }
})