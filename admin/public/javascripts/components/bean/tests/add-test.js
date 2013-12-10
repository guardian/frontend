/*global bean:true, buster:true, Syn:true, assert:true, defer:true, features:true, globalSetUp:true, globalTearDown:true*/

buster.testCase('add', {
    'setUp': globalSetUp
  , 'tearDown': globalTearDown

  , 'should return the element passed in': {
        'setUp': function () {
          var self = this
          this.runTest = function (method) {
            var el       = self.byId('input')
              , returned = bean[method](el, 'click', function () {})

            assert.same(el, returned, 'returns the element passed in')
          }
        }
      , 'on()': function () { this.runTest('on') }
      , 'add()': function () { this.runTest('add') }
    }

  , 'should be able to add single events to elements': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, method) {
            var el      = self.byId('input')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function() {
              assert(spy.calledOnce, 'adds single events to elements ')
              done()
            })

            bean[method](el, 'click', trigger.wrap(spy))

            Syn.click(el)
          }
        }
      , 'on()': function (done) { this.runTest(done, 'on') }
      , 'add()': function (done) { this.runTest(done, 'add') }
    }

  , 'should be able to add single events to objects': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, method) {
            var obj     = this.newObj()
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              assert(spy.calledOnce, 'adds single events to objects')
              done()
            })

            bean[method](obj, 'complete', trigger.wrap(spy))
            bean.fire(obj, 'complete')
            bean.remove(obj)
            bean.fire(obj, 'complete')
          }
        }
      , 'on()': function (done) { this.runTest(done, 'on') }
      , 'add()': function (done) { this.runTest(done, 'add') }
    }

  , 'scope should be equal to element': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, method) {
            var el      = self.byId('input')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              assert.equals(spy.callCount, 1, 'single call')
              assert(spy.calledOn(el), 'called with element as scope (this)')
              done()
            })

            bean[method](el, 'click', trigger.wrap(spy))

            Syn.click(el)
          }
        }
      , 'on()': function (done) { this.runTest(done, 'on') }
      , 'add()': function (done) { this.runTest(done, 'add') }
    }

  , 'should recieve an event method': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, method) {
            var el      = self.byId('input')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              assert(spy.calledOnce, 'single call')
              assert.equals(spy.firstCall.args.length, 1, 'called with an object')
              assert(!!spy.firstCall.args[0].stop, 'called with an event object')
              done()
            })

            bean[method](el, 'click', trigger.wrap(spy))

            Syn.click(el)
          }
        }
      , 'on()': function (done) { this.runTest(done, 'on') }
      , 'add()': function (done) { this.runTest(done, 'add') }
    }

  , 'should be able to pass x amount of additional arguments': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, method) {
            var el      = self.byId('input')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              assert(spy.calledOnce, 'single call')
              assert.equals(spy.firstCall.args.length, 4, 'called with an event object and 3 additional arguments')
              assert.equals(spy.firstCall.args[1], 1, 'called with correct argument')
              assert.equals(spy.firstCall.args[2], 2, 'called with correct argument')
              assert.equals(spy.firstCall.args[3], 3, 'called with correct argument')
              done()
            })

            bean[method](el, 'click', trigger.wrap(spy), 1, 2, 3)

            Syn.click(el)
          }
        }
      , 'on()': function (done) { this.runTest(done, 'on') }
      , 'add()': function (done) { this.runTest(done, 'add') }
    }

  , 'should be able to add multiple events by space seperating them': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, method) {
            var el      = self.byId('input')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              assert.equals(spy.callCount, 2, 'adds multiple events by space seperating them')
              done()
            })
       
            bean[method](el, 'click keypress', trigger.wrap(spy))

            Syn.click(el).key('j')
          }
        }
      , 'on()': function (done) { this.runTest(done, 'on') }
      , 'add()': function (done) { this.runTest(done, 'add') }
    }

  , 'should be able to add multiple events of the same type': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, method) {
            var el      = self.byId('input')
              , trigger = self.trigger()
              , spy1    = self.spy()
              , spy2    = self.spy()
              , spy3    = self.spy()

            trigger.after(function () {
              assert(spy1.calledOnce, 'adds multiple events of the same type (1)')
              assert(spy2.calledOnce, 'adds multiple events of the same type (2)')
              assert(spy3.calledOnce, 'adds multiple events of the same type (3)')
              done()
            })

            bean[method](el, 'click', trigger.wrap(spy1))
            bean[method](el, 'click', trigger.wrap(spy2))
            bean[method](el, 'click', trigger.wrap(spy3))

            Syn.click(el)
          }
        }
      , 'on()': function (done) { this.runTest(done, 'on') }
      , 'add()': function (done) { this.runTest(done, 'add') }
    }

  , 'should be able to add multiple events simultaneously with an object literal': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, method) {
            var el         = self.byId('input')
              , trigger    = self.trigger()
              , clickSpy   = self.spy()
              , keydownSpy = self.spy()

            trigger.after(function () {
              assert.equals(clickSpy.callCount, 1, 'adds multiple events simultaneously with an object literal (click)')
              assert.equals(keydownSpy.callCount, 1, 'adds multiple events simultaneously with an object literal (keydown)')
              done()
            })

            bean[method](el, { click: trigger.wrap(clickSpy), keydown: trigger.wrap(keydownSpy) })

            Syn.click(el).key('j')
          }
        }
      , 'on()': function (done) { this.runTest(done, 'on') }
      , 'add()': function (done) { this.runTest(done, 'add') }
    }

  , 'should bubble up dom': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, method) {
            var el1     = self.byId('foo')
              , el2     = self.byId('bar')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              assert(spy.calledOnce, 'bubbles up dom')
              done()
            })

            bean[method](el1, 'click', trigger.wrap(spy))

            Syn.click(el2)
          }
        }
      , 'on()': function (done) { this.runTest(done, 'on') }
      , 'add()': function (done) { this.runTest(done, 'add') }
    }

  , 'shouldn\'t trigger event when adding additional custom event listeners': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, method) {
            var el  = self.byId('input')
              , spy = self.spy()

            bean[method](el, 'foo', spy)
            bean[method](el, 'foo', spy)

            defer(function () {
              refute(spy.called, 'additional custom event listeners trigger event')
              done()
            })
          }
        }
      , 'on()': function (done) { this.runTest(done, 'on') }
      , 'add()': function (done) { this.runTest(done, 'add') }
    }

  , 'should bind onmessage to window': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, method) {
            if (features.message) {
              var calls = 0
                , trigger = self.trigger()

              this.removables.push(window)

              trigger.after(function () {
                assert.equals(calls, 1, 'message event activated')
              })

              // unfortunately we can't use a spy here because we want to inspect the original event
              // object which isn't available in IE8 (and previous, but there is no postMessage in IE<8)
              // after a setTimeout()
              bean[method](window, 'message', trigger.wrap(function (event) {
                calls++
                assert(event, 'has event object argument')
                assert.equals(event.data, 'hello there', 'data should be copied')
                assert.same(event.origin, event.originalEvent.origin, 'origin should be copied')
                assert.same(event.source, event.originalEvent.source, 'source should be copied')
                done()
              }))

              window.postMessage('hello there', '*')
            } else {
              assert(true, 'message events not supported by this browser, test bypassed')
              done()
            }
          }
        }
      , 'on()': function (done) { this.runTest(done, 'on') }
      , 'add()': function (done) { this.runTest(done, 'add') }
    }

  , 'one: should only trigger handler once': {
        'setUp': function () {
          var self = this
          this.runTest = function (done) {
            var el      = self.byId('input')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              assert.equals(spy.callCount, 1, 'handler called exactly one time')
              done()
            })

            bean.one(el, 'click', trigger.wrap(spy))
            Syn.click(el)
            Syn.click(el)
            Syn.click(el)
          }
        }
      , 'on()': function (done) { this.runTest(done, 'on') }
      , 'add()': function (done) { this.runTest(done, 'add') }
    }

  , 'one: should be removable': {
        'setUp': function () {
          var self = this
          this.runTest = function (done) {
            var el  = self.byId('input')
              , spy = self.spy()

            bean.one(el, 'click', spy)
            bean.remove(el, 'click', spy)
            Syn.click(el)
            Syn.click(el)

            defer(function () {
              refute(spy.called, 'handler shouldn\'t be called')
              done()
            })
          }
        }
      , 'on()': function (done) { this.runTest(done, 'on') }
      , 'add()': function (done) { this.runTest(done, 'add') }
    }
})