!function ($) {
  var r = require('reqwest')
    , integrate = function(method) {
        return function() {
          var args = Array.prototype.slice.call(arguments, 0)
            , i = (this && this.length) || 0
          while (i--) args.unshift(this[i])
          return r[method].apply(null, args)
        }
      }
    , s = integrate('serialize')
    , sa = integrate('serializeArray')

  $.ender({
      ajax: r
    , serialize: r.serialize
    , serializeArray: r.serializeArray
    , toQueryString: r.toQueryString
  })

  $.ender({
      serialize: s
    , serializeArray: sa
  }, true)
}(ender);
