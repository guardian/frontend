/*global bean:true, buster:true, Syn:true, assert:true, defer:true, features:true, globalSetUp:true, globalTearDown:true*/

buster.testCase('custom', {
    'setUp': globalSetUp
  , 'tearDown': globalTearDown

  , 'should be able to add single custom events': function (done) {
      var el      = this.byId('input')
        , trigger = this.trigger()
        , spy     = this.spy()

      trigger.after(function () {
        assert(spy.calledOnce, 'add single custom events')
        done()
      })

      bean.add(el, 'partytime', trigger.wrap(spy))
      bean.fire(el, 'partytime')
    }

  , 'should bubble up dom like traditional events': function (done) {
      if (features.w3c) {
        //dean edwards' onpropertychange hack doesn't bubble unfortunately :(
        var el1     = this.byId('foo')
          , el2     = this.byId('bar')
          , trigger = this.trigger()
          , spy     = this.spy()

        trigger.after(function () {
          assert(spy.calledOnce, 'bubbles up dom like traditional events')
          done()
        })

        bean.add(el1, 'partytime', trigger.wrap(spy))
        bean.fire(el2, 'partytime')
      } else {
        assert(true, 'onpropertychange bubbling not supported by this browser, test bypassed')
        done()
      }
    }

  , 'should be able to add, fire and remove custom events to document': function (done) {
      var calls   = 0
        , trigger = this.trigger()

      this.removables.push(document)

      trigger.after(function () {
        assert.equals(calls, 1, 'add custom events to document')
        done()
      })

      bean.add(document, 'justlookatthat', trigger.wrap(function () {
        calls++
        bean.remove(document, 'justlookatthat')
      }))

      bean.fire(document, 'justlookatthat')
      bean.fire(document, 'justlookatthat')
    }

  , 'should be able to add, fire and remove custom events to window': function (done) {
      var calls   = 0
        , trigger = this.trigger()

      trigger.after(function () {
        assert.equals(calls, 1, 'add custom events to window')
        done()
      })

      this.removables.push(window)

      bean.add(window, 'spiffy', trigger.wrap(function () {
        calls++
        bean.remove(window, 'spiffy')
      }))

      bean.fire(window, 'spiffy')
      bean.fire(window, 'spiffy')
    }
})