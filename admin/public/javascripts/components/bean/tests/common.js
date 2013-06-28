/*global bean:true, qwery:true*/

var fixturesHTML =
  '<input id="input" type="text" />\n' +
  '<input id="input2" type="text" />\n' +
  '<div id="foo">\n' +
  '  <div id="bar" class="bar">\n' +
  '    <div id="bang" class="bang"></div>\n' +
  '  </div>\n' +
  '  <div id="baz" class="baz"></div>\n' +
  '</div>\n' +
  '<div id="stopper">\n' +
  '  <input type="text" id="txt" value="">\n' +
  '</div>\n'

var features = {
        w3c: !!window.addEventListener
      , qSA: !!document.querySelectorAll
      , createEvent: (function () {
          try {
            document.createEvent('KeyEvents')
            return true
          } catch (e) {
            try {
              document.createEvent('TextEvent')
              return true
            } catch (e) { }
          }
          return false
        }())
      , message: !!window.postMessage
      , history: !!window.history && !!window.history.pushState
    }
  , defer = function (fn, t) {
      setTimeout(fn, t || 1)
    }
  , insertFixtures = function () {
      document.body.appendChild((function() {
        var fixtures = document.createElement('div')
        fixtures.id = 'fixtures'
        fixtures.innerHTML = fixturesHTML
        fixtures.style.position = 'absolute'
        fixtures.style.left = '-999px'
        return fixtures
      }()))
    }
  , removeFixtures = function () {
      document.body.removeChild(document.getElementById('fixtures'))
    }
  , SpyTrigger = function () {}
  , globalSetUp = function () {
      var removables = this.removables = []
      this.timeout = 1000

      this.byId = function (id) {
        var el = document.getElementById(id)
        if (el) {
          bean.remove(el)
          removables.push(el) // auto clean up
        }
        return el
      }

      this.newObj = function () {
        var obj = {}
        removables.push(obj) // auto clean up
        return obj
      }

      this.createElement = function (tag) {
        var el = document.createElement(tag)
        removables.push(el)
        return el
      }

      this.trigger = function () {
        return new SpyTrigger()
      }
    }
  , globalTearDown = function () {
      for (var i = 0; i < this.removables.length; i++)
        bean.remove(this.removables[i])

      //removeFixtures()
    }

SpyTrigger.prototype.after = function (fn, delay) {
  this._after = fn
  this._delay = delay || 1
}
SpyTrigger.prototype.wrap = function (spy) {
  if (spy._SpyTriggerWrap)
    return spy._SpyTriggerWrap

  var self = this
    , fn = function () {
        self._trigger()
        spy.apply(this, arguments)
      }
  fn.$ = spy
  spy._SpyTriggerWrap = fn
  return fn
}
SpyTrigger.prototype.wrapped = function (spy) {
  return spy._SpyTriggerWrap
}
SpyTrigger.prototype._trigger = function () {
  if (this._after) {
    this.reset()
    this._timeout = setTimeout(this._after, this._delay)
  }
}
SpyTrigger.prototype.reset = function () {
  if (this._timeout) clearTimeout(this._timeout)
}

if (!window.console) window.console = { log: function () {}}
insertFixtures()