/*global bean:true, buster:true, Syn:true, assert:true, defer:true, features:true, globalSetUp:true, globalTearDown:true*/

buster.testCase('namespaces', {
    'setUp': globalSetUp
  , 'tearDown': globalTearDown

  , 'should be able to name handlers': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            var el1     = self.byId('foo')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              assert.equals(spy.callCount, 1, 'triggered click event')
              done()
            })

            regFn(el1, trigger.wrap(spy))

            Syn.click(el1)
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.on(el1, 'click.fat', wrappedSpy)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.add(el1, 'click.fat', wrappedSpy)
          })
        }
    }

  , 'should be able to add multiple handlers under the same namespace to the same element': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            var el1     = self.byId('foo')
              , trigger = self.trigger()
              , spy1    = self.spy()
              , spy2    = self.spy()

            trigger.after(function () {
              assert.equals(spy1.callCount, 1, 'triggered click event')
              assert.equals(spy2.callCount, 1, 'triggered click event')
              done()
            })

            regFn(el1, trigger.wrap(spy1), trigger.wrap(spy2))

            Syn.click(el1)
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, wrappedSpy1, wrappedSpy2) {
            bean.on(el1, 'click.fat', wrappedSpy1)
            bean.on(el1, 'click.fat', wrappedSpy2)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, wrappedSpy1, wrappedSpy2) {
            bean.add(el1, 'click.fat', wrappedSpy1)
            bean.add(el1, 'click.fat', wrappedSpy2)
          })
        }
    }

  , 'should be able to fire an event without handlers': function () {
      var el1 = this.byId('foo')

      bean.fire(el1, 'click.fat')

      assert(true, 'fire namespaced event with no handlers (no exception)')
    }

  , 'should be able to target namespaced event handlers with fire': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            var el1     = self.byId('foo')
              , trigger = self.trigger()
              , spy1    = self.spy()
              , spy2    = self.spy()

            trigger.after(function () {
              assert.equals(spy1.callCount, 1, 'triggered click event (namespaced)')
              assert.equals(spy2.callCount, 0, 'should not trigger click event (plain)')
              done()
            })

            regFn(el1, trigger.wrap(spy1), trigger.wrap(spy2))

            bean.fire(el1, 'click.fat')
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, wrappedSpy1, wrappedSpy2) {
            bean.on(el1, 'click.fat', wrappedSpy1)
            bean.on(el1, 'click', wrappedSpy2)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, wrappedSpy1, wrappedSpy2) {
            bean.add(el1, 'click.fat', wrappedSpy1)
            bean.add(el1, 'click', wrappedSpy2)
          })
        }
    }

    // changed in 0.5 so this doesn't fire, namespaces need to match
  , 'should not be able to target multiple namespaced event handlers with fire': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            var el1     = self.byId('foo')
              , spy1    = self.spy()
              , spy2    = self.spy()
              , spy3    = self.spy()

            regFn(el1, spy1, spy2, spy3)

            bean.fire(el1, 'click.fat.ded')

            defer(function () {
              assert.equals(spy1.callCount, 0, 'should not trigger click event (namespaced)')
              assert.equals(spy2.callCount, 0, 'should not trigger click event (namespaced)')
              assert.equals(spy3.callCount, 0, 'should not trigger click event (plain)')
              done()
            })
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, wrappedSpy1, wrappedSpy2, wrappedSpy3) {
            bean.on(el1, 'click.fat', wrappedSpy1)
            bean.on(el1, 'click.ded', wrappedSpy2)
            bean.on(el1, 'click', wrappedSpy3)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, wrappedSpy1, wrappedSpy2, wrappedSpy3) {
            bean.add(el1, 'click.fat', wrappedSpy1)
            bean.add(el1, 'click.ded', wrappedSpy2)
            bean.add(el1, 'click', wrappedSpy3)
          })
        }
    }

  , 'should be able to remove handlers based on name': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            var el1     = self.byId('foo')
              , trigger = self.trigger()
              , spy1    = self.spy()
              , spy2    = self.spy()

            trigger.after(function () {
              assert.equals(spy1.callCount, 0, 'should not trigger click event (namespaced)')
              assert.equals(spy2.callCount, 1, 'triggered click event (plain)')
              done()
            })

            regFn(el1, trigger.wrap(spy1), trigger.wrap(spy2))

            bean.remove(el1, 'click.ded')

            Syn.click(el1)
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, wrappedSpy1, wrappedSpy2) {
            bean.on(el1, 'click.ded', wrappedSpy1)
            bean.on(el1, 'click', wrappedSpy2)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, wrappedSpy1, wrappedSpy2) {
            bean.add(el1, 'click.ded', wrappedSpy1)
            bean.add(el1, 'click', wrappedSpy2)
          })
        }
    }

    // changed in 0.5 so this doesn't remove, namespaces need to match
  , 'should not be able to remove multiple handlers based on name': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            var el1     = self.byId('foo')
              , trigger = self.trigger()
              , spy1    = self.spy()
              , spy2    = self.spy()
              , spy3    = self.spy()

            trigger.after(function () {
              assert.equals(spy1.callCount, 1, 'triggered click event (namespaced)')
              assert.equals(spy2.callCount, 1, 'triggered click event (namespaced)')
              assert.equals(spy3.callCount, 1, 'triggered click event (plain)')
              done()
            })

            regFn(el1, trigger.wrap(spy1), trigger.wrap(spy2), trigger.wrap(spy3))

            bean.remove(el1, 'click.ded.fat')

            Syn.click(el1)
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, wrappedSpy1, wrappedSpy2, wrappedSpy3) {
            bean.on(el1, 'click.fat', wrappedSpy1)
            bean.on(el1, 'click.ded', wrappedSpy2)
            bean.on(el1, 'click', wrappedSpy3)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, wrappedSpy1, wrappedSpy2, wrappedSpy3) {
            bean.add(el1, 'click.fat', wrappedSpy1)
            bean.add(el1, 'click.ded', wrappedSpy2)
            bean.add(el1, 'click', wrappedSpy3)
          })
        }
    }

  , 'should be able to add multiple custom events to a single handler and call them individually': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            var el1     = self.byId('foo')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              assert.equals(spy.callCount, 2, 'triggered custom event')
              assert.equals(spy.firstCall.args[0], '1', 'expected array argument')
              assert.equals(spy.secondCall.args[0], '2', 'expected array argument')
              done()
            })

            regFn(el1, trigger.wrap(spy))

            bean.fire(el1, 'fat.test1', ['1'])
            bean.fire(el1, 'fat.test2', ['2'])
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.on(el1, 'fat.test1 fat.test2', wrappedSpy)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.add(el1, 'fat.test1 fat.test2', wrappedSpy)
          })
        }
    }
    
  , 'should be able to fire an event if the fired namespace is within the event namespace range': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            var el1     = self.byId('foo')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              assert.equals(spy.callCount, 4, 'triggered custom event')
              assert.equals(spy.firstCall.args[0], '1', 'expected array argument')
              assert.equals(spy.secondCall.args[0], '2', 'expected array argument')
              assert.equals(spy.thirdCall.args[0], '3', 'expected array argument')
              assert.equals(spy.lastCall.args[0], '3', 'expected array argument')
              done()
            })

            regFn(el1, trigger.wrap(spy))

            bean.fire(el1, 'fat.test1', ['1'])
            bean.fire(el1, 'fat.test2', ['2'])
            bean.fire(el1, 'fat.foo', ['3'])
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.on(el1, 'fat.test1.foo fat.test2.foo', wrappedSpy)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.add(el1, 'fat.test1.foo fat.test2.foo', wrappedSpy)
          })
        }
    }

  , 'should be able to fire multiple events and fire them regardless of the order of the namespaces': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            var el1     = self.byId('foo')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              assert.equals(spy.callCount, 4, 'triggered custom event')
              assert.equals(spy.firstCall.args[0], '1', 'expected array argument')
              assert.equals(spy.secondCall.args[0], '1', 'expected array argument')
              assert.equals(spy.thirdCall.args[0], '2', 'expected array argument')
              assert.equals(spy.lastCall.args[0], '2', 'expected array argument')
              done()
            })

            regFn(el1, trigger.wrap(spy))

            bean.fire(el1, 'fat.test.foo', ['1'])
            bean.fire(el1, 'fat.foo.test', ['2'])
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.on(el1, 'fat.test.foo fat.foo.test', wrappedSpy)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.add(el1, 'fat.test.foo fat.foo.test', wrappedSpy)
          })
        }
    }
    
  , 'should only fire an event if the fired namespaces is within the event namespace or if the event namespace is within the fired namespace': {
        'setUp': function () {
          var self = this
          this.runTest = function (done, regFn) {
            var el1     = self.byId('foo')
              , trigger = self.trigger()
              , spy     = self.spy()

            trigger.after(function () {
              assert.equals(spy.callCount, 5, 'triggered custom event')
              assert.equals(spy.firstCall.args[0], '1', 'expected array argument')
              assert.equals(spy.secondCall.args[0], '1', 'expected array argument')
              assert.equals(spy.thirdCall.args[0], '2', 'expected array argument')
              assert.equals(spy.getCall(3).args[0], '2', 'expected array argument')
              assert.equals(spy.getCall(4).args[0], '3', 'expected array argument')
              done()
            })

            regFn(el1, trigger.wrap(spy))

            bean.fire(el1, 'fat.test.foo', ['1'])
            bean.fire(el1, 'fat.foo.test', ['2'])
            bean.fire(el1, 'fat.test.ded', ['3'])
          }
        }
      , 'on()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.on(el1, 'fat.test.foo.ded fat.foo.test fat.ded', wrappedSpy)
          })
        }
      , 'add()': function (done) {
          this.runTest(done, function (el1, wrappedSpy) {
            bean.add(el1, 'fat.test.foo.ded fat.foo.test fat.ded', wrappedSpy)
          })
        }
    }
})