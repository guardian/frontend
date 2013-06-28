/*global bean:true, qwery:true, buster:true, Syn:true, assert:true, defer:true, features:true, globalSetUp:true, globalTearDown:true*/

buster.testCase('delegate', {
    'setUp': function () {
      globalSetUp.call(this)

      bean.setSelectorEngine(qwery)

      this.verifySimpleDelegateSpy = function (spy, target) {
        assert.equals(spy.callCount, 2, 'delegated on selector')
        assert.same(spy.thisValues[0], target, 'context (this) was set to delegated element')
        assert.same(spy.thisValues[1], target, 'context (this) was set to delegated element')
        assert(spy.firstCall.args[0], 'got an event object argument')
        assert(spy.secondCall && spy.secondCall.args[0], 'got an event object argument')
        assert.same(spy.firstCall.args[0].currentTarget, target, 'degated event has currentTarget property correctly set')
        assert.same(spy.secondCall && spy.secondCall.args[0].currentTarget, target, 'degated event has currentTarget property correctly set')
      }
    }

  , 'tearDown': function () {
      globalTearDown.call(this)
      bean.setSelectorEngine() // reset to default
    }

  , 'should be able to delegate on selectors': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            var el1     = self.byId('foo')
              , el2     = self.byId('bar')
              , el3     = self.byId('baz')
              , el4     = self.byId('bang')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              self.verifySimpleDelegateSpy(spy, el2)
              done()
            })

            regFn(el1, trigger.wrap(spy))

            Syn.click(el2)
            Syn.click(el3)
            Syn.click(el4)
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.on(el1, 'click', '.bar', wrappedSpy)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.add(el1, '.bar', 'click', wrappedSpy)
          })
        }
    }

  , 'should be able to delegate multiple events': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            var el1     = self.byId('foo')
              , el2     = self.byId('bar')
              , el3     = self.byId('baz')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              self.verifySimpleDelegateSpy(spy, el2)
              done()
            }, 50)

            regFn(el1, trigger.wrap(spy))

            Syn.click(el2)
            Syn.click(el3)
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.on(el1, 'mouseup mousedown', '.bar', wrappedSpy)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.add(el1, '.bar', 'mouseup mousedown', wrappedSpy)
          })
        }
    }

  , 'should be able to delegate on array': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            var el1     = self.byId('foo')
              , el2     = self.byId('bar')
              , el3     = self.byId('baz')
              , el4     = self.byId('bang')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              self.verifySimpleDelegateSpy(spy, el2)
              done()
            })

            regFn(el1, el2, trigger.wrap(spy))

            Syn.click(el2)
            Syn.click(el3)
            Syn.click(el4)
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, el2, wrappedSpy) {
            bean.on(el1, 'click', [el2], wrappedSpy)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, el2, wrappedSpy) {
            bean.add(el1, [el2], 'click', wrappedSpy)
          })
        }
    }

  , 'should be able to remove delegated handler': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            var el1     = self.byId('foo')
              , el2     = self.byId('bar')
              , calls   = 0
              , trigger = self.trigger(50)
              , fn      = function () {
                  calls++
                  bean.remove(el1, 'click', trigger.wrapped(fn))
                }

            trigger.after(function () {
              assert.equals(calls, 1, 'degegated event triggered once')
              done()
            })

            regFn(el1, trigger.wrap(fn))

            Syn.click(el2)
            Syn.click(el2)
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.on(el1, 'click', '.bar', wrappedSpy)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.add(el1, '.bar', 'click', wrappedSpy)
          })
        }
    }

  , 'should use qSA if available': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            if (!features.qSA) {
              assert(true, 'qSA not available in this browser, skipping test')
              return done()
            }

            var el1     = self.byId('foo')
              , el2     = self.byId('bar')
              , el3     = self.byId('baz')
              , el4     = self.byId('bang')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              self.verifySimpleDelegateSpy(spy, el2)
              done()
            })

            bean.setSelectorEngine() // reset to default
            regFn(el1, trigger.wrap(spy))

            Syn.click(el2)
            Syn.click(el3)
            Syn.click(el4)
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.on(el1, 'click', '.bar', wrappedSpy)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.add(el1, '.bar', 'click', wrappedSpy)
          })
        }
    }

  , 'should throw error when no qSA available and no selector engine set': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            if (features.qSA) {
              assert(true, 'qSA available in this browser, skipping test')
              return done()
            }

            var el1     = self.byId('foo')
              , el2     = self.byId('bar')
              , spy     = self.spy()

            bean.setSelectorEngine() // reset to default
            regFn(el1, spy)

            window.onerror = function (e) {
              assert(e.toString(), /Bean/, 'threw Error on delegated event trigger without selector engine or qSA')
              window.onerror = null
            }

            Syn.click(el2)

            defer(function () {
              assert.equals(spy.callCount, 0, 'don\'t fire delegated event without selector engine or qSA')
              done()
            })
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.on(el1, 'click', '.bar', wrappedSpy)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.add(el1, '.bar', 'click', wrappedSpy)
          })
        }
    }

  , 'should be able to set a default selector engine': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            var el1      = self.byId('foo')
              , el2      = self.byId('bar')
              , el3      = self.byId('baz')
              , el4      = self.byId('bang')
              , selector = 'SELECTOR? WE DON\'T NEED NO STINKIN\' SELECTOR!'
              , trigger  = self.trigger()
              , stub     = self.stub()
              , spy      = self.spy()

            trigger.after(function () {
              // 6, see? lots of wasteful calls
              assert.equals(stub.callCount, 6, 'selector engine called')
              assert.same(stub.firstCall.args[0], selector, 'selector engine called with selector argument')
              assert.same(stub.firstCall.args[1], el1, 'selector engine called with root argument')
              self.verifySimpleDelegateSpy(spy, el2)
              bean.setSelectorEngine(null)
              done()
            })

            stub.returns([el2])
            // TODO: findTarget() is called for setting event.currentTarget as well as checking for a match
            // fix this so it's only called once, otherwise it's a waste
            bean.setSelectorEngine(stub)

            regFn(el1, selector, trigger.wrap(spy))

            Syn.click(el2)
            Syn.click(el3)
            Syn.click(el4)
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, selector, wrappedSpy) {
            bean.on(el1, 'click', selector, wrappedSpy)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, selector, wrappedSpy) {
            bean.add(el1, selector, 'click', wrappedSpy)
          })
        }
    }
})