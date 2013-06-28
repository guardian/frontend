!function ($) {
  var b = require('bean')

    , integrate = function (method, type, method2) {
        var _args = type ? [type] : []
        return function () {
          for (var i = 0, l = this.length; i < l; i++) {
            if (!arguments.length && method == 'on' && type) method = 'fire'
            b[method].apply(this, [this[i]].concat(_args, Array.prototype.slice.call(arguments, 0)))
          }
          return this
        }
      }

    , add   = integrate('add')
    , on    = integrate('on')
    , one   = integrate('one')
    , off   = integrate('off')
    , fire  = integrate('fire')
    , clone = integrate('clone')

    , hover = function (enter, leave, i) { // i for internal
        for (i = this.length; i--;) {
          b.on.call(this, this[i], 'mouseenter', enter)
          b.on.call(this, this[i], 'mouseleave', leave)
        }
        return this
      }

    , methods = {
          on             : on
        , addListener    : on
        , bind           : on
        , listen         : on
        , delegate       : add // jQuery compat, same arg order as add()

        , one            : one

        , off            : off
        , unbind         : off
        , unlisten       : off
        , removeListener : off
        , undelegate     : off

        , emit           : fire
        , trigger        : fire

        , cloneEvents    : clone

        , hover          : hover
      }

    , shortcuts =
         ('blur change click dblclick error focus focusin focusout keydown keypress '
        + 'keyup load mousedown mouseenter mouseleave mouseout mouseover mouseup '
        + 'mousemove resize scroll select submit unload').split(' ')

  for (var i = shortcuts.length; i--;) {
    methods[shortcuts[i]] = integrate('on', shortcuts[i])
  }

  b.setSelectorEngine($)

  $.ender(methods, true)
}(ender);