/*jshint maxlen:80*/
/*global reqwest:true, sink:true, start:true, ender:true, v:true, boosh:true*/

(function (ajax) {
  var BIND_ARGS = 'bind'
    , PASS_ARGS = 'pass'
    , FakeXHR = (function () {
        function FakeXHR () {
          this.args = {}
          FakeXHR.last = this
        }
        FakeXHR.setup = function () {
          FakeXHR.oldxhr = window['XMLHttpRequest']
          FakeXHR.oldaxo = window['ActiveXObject']
          window['XMLHttpRequest'] = FakeXHR
          window['ActiveXObject'] = FakeXHR
          FakeXHR.last = null
        }
        FakeXHR.restore = function () {
          window['XMLHttpRequest'] = FakeXHR.oldxhr
          window['ActiveXObject'] = FakeXHR.oldaxo
        }
        FakeXHR.prototype.methodCallCount = function (name) {
          return this.args[name] ? this.args[name].length : 0
        }
        FakeXHR.prototype.methodCallArgs = function (name, i, j) {
          var a = this.args[name]
              && this.args[name].length > i ? this.args[name][i] : null
          if (arguments.length > 2) return a && a.length > j ? a[j] : null
          return a
        }
        v.each(['open', 'send', 'setRequestHeader' ], function (f) {
          FakeXHR.prototype[f] = function () {
            if (!this.args[f]) this.args[f] = []
            this.args[f].push(arguments)
          }
        })
        return FakeXHR
      }())

  sink('Setup', function (test, ok, before, after) {
    before(function () {
      ajax.ajaxSetup({
        dataFilter: function (resp, type) {
          // example filter to prevent json hijacking
          return resp.substring('])}while(1);</x>'.length)
        }
      })
    })
    after(function () {
      ajax.ajaxSetup({
        // reset to original data filter
        dataFilter: function (resp, type) {
          return resp
        }
      })
    })
    test('dataFilter', function (complete) {
      ajax({
          url: '/tests/fixtures/fixtures_with_prefix.json'
        , type: 'json'
        , success: function (resp) {
            ok(resp, 'received response')
            ok(
                resp && resp.boosh == 'boosh'
              , 'correctly evaluated response as JSON'
            )
            complete()
          }
      })
    })
  })

  sink('Mime Types', function (test, ok) {
    test('JSON', function (complete) {
      ajax({
          url: '/tests/fixtures/fixtures.json'
        , type: 'json'
        , success: function (resp) {
            ok(resp, 'received response')
            ok(
                resp && resp.boosh == 'boosh'
              , 'correctly evaluated response as JSON'
            )
            complete()
          }
      })
    })

    test('JSONP', function (complete) {
      // stub callback prefix
      reqwest.getcallbackPrefix = function (id) {
        return 'reqwest_' + id
      }
      ajax({
          url: '/tests/fixtures/fixtures_jsonp.jsonp?callback=?'
        , type: 'jsonp'
        , success: function (resp) {
            ok(resp, 'received response for unique generated callback')
            ok(
                resp && resp.boosh == 'boosh'
              , 'correctly evaled response for unique generated cb as JSONP'
            )
            complete()
          }
      })
    })

    test('JS', function (complete) {
      ajax({
          url: '/tests/fixtures/fixtures.js'
        , type: 'js'
        , success: function () {
            ok(
                typeof boosh !== 'undefined' && boosh == 'boosh'
              , 'evaluated response as JavaScript'
            )
            complete()
          }
      })
    })

    test('HTML', function (complete) {
      ajax({
          url: '/tests/fixtures/fixtures.html'
        , type: 'html'
        , success: function (resp) {
            ok(resp == '<p>boosh</p>', 'evaluated response as HTML')
            complete()
          }
      })
    })

    test('XML', function (complete) {
      ajax({
          url: '/tests/fixtures/fixtures.xml'
        , type: 'xml'
        , success: function (resp) {
            ok(resp
                && resp.documentElement
                && resp.documentElement.nodeName == 'root'
              , 'XML Response root is <root>'
            )
            ok(resp
                && resp.documentElement
                && resp.documentElement.hasChildNodes
                && resp.documentElement.firstChild.nodeName == 'boosh'
                && resp.documentElement.firstChild.firstChild.nodeValue
                    == 'boosh'
              , 'Correct XML response'
            )
            complete()
          }
        , error: function (err) {
            ok(false, err.responseText)
            complete()
          }
      })
    })

    test('XML (404)', function (complete) {
      ajax({
          url:'/tests/fixtures/badfixtures.xml'
        , type:'xml'
        , success: function (resp) {
            if (resp == null) {
              ok(true, 'XML response is null')
              complete()
            } else {
              ok(resp
                  && resp.documentElement
                  && resp.documentElement.firstChild
                  && (/error/i).test(resp.documentElement.firstChild.nodeValue)
                , 'XML response reports parsing error'
              )
              complete()
            }
          }
        , error: function () {
            ok(true, 'No XML response (error())')
            complete()
          }
      })
    })
  })

  sink('JSONP', function (test, ok) {
    test('Named callback in query string', function (complete) {
      ajax({
          url: '/tests/fixtures/fixtures_jsonp2.jsonp?foo=bar'
        , type: 'jsonp'
        , jsonpCallback: 'foo'
        , success: function (resp) {
            ok(resp, 'received response for custom callback')
            ok(
                resp && resp.boosh == 'boosh'
              , 'correctly evaluated response as JSONP with custom callback'
            )
            complete()
          }
      })
    })

    test('Unnamed callback in query string', function (complete) {
      ajax({
          url: '/tests/fixtures/fixtures_jsonp3.jsonp?foo=?'
        , type: 'jsonp'
        , jsonpCallback: 'foo'
        , success: function (resp) {
            ok(resp, 'received response for custom wildcard callback')
            ok(
                resp && resp.boosh == 'boosh'
              , 'correctly evaled response as JSONP with custom wildcard cb'
            )
            complete()
          }
      })
    })

    test('No callback, no query string', function (complete) {
      ajax({
          url: '/tests/fixtures/fixtures_jsonp3.jsonp'
        , type: 'jsonp'
        , jsonpCallback: 'foo'
        , success: function (resp) {
            ok(resp, 'received response for custom wildcard callback')
            ok(
                resp && resp.boosh == 'boosh'
              , 'correctly evaled response as JSONP with custom cb not in url'
            )
            complete()
          }
      })
    })

    test('No callback in existing query string', function (complete) {
      ajax({
          url: '/tests/none.jsonp?echo&somevar=some+long+str+here'
        , type: 'jsonp'
        , jsonpCallbackName: 'yohoho'
        , success: function (resp) {
            ok(resp && resp.query, 'received response from echo callback')
            ok(
                resp && resp.query && resp.query.somevar == 'some long str here'
              , 'correctly evaluated response as JSONP with echo callback'
            )
            complete()
          }
      })
    })

    test('Append data to existing query string', function (complete) {
      ajax({
          url: '/tests/none.jsonp?echo' // should append &somevar...
        , type: 'jsonp'
        , data: { somevar: 'some long str here', anothervar: 'yo ho ho!' }
        , success: function (resp) {
            ok(resp && resp.query, 'received response from echo callback')
            ok(
                resp && resp.query && resp.query.somevar == 'some long str here'
              , 'correctly sent and received data object from JSONP echo (1)'
            )
            ok(
                resp && resp.query && resp.query.anothervar == 'yo ho ho!'
              , 'correctly sent and received data object from JSONP echo (2)'
            )
            complete()
          }
      })
    })

    test('Generate complete query string from data', function (complete) {
      ajax({
          url: '/tests/none.jsonp' // should append ?echo...etc.
        , type: 'jsonp'
        , data: [
              { name: 'somevar', value: 'some long str here' }
            , { name: 'anothervar', value: 'yo ho ho!' }
            , { name: 'echo', value: true }
          ]
        , success: function (resp) {
            ok(resp && resp.query, 'received response from echo callback')
            ok(
                resp && resp.query && resp.query.somevar == 'some long str here'
              , 'correctly sent and received data array from JSONP echo (1)'
            )
            ok(
                resp && resp.query && resp.query.anothervar == 'yo ho ho!'
              , 'correctly sent and received data array from JSONP echo (2)'
            )
            complete()
          }
      })
    })

    test('Append data to query string and insert callback name'
        , function (complete) {

      ajax({
          // should append data and match callback correctly
          url: '/tests/none.jsonp?callback=?'
        , type: 'jsonp'
        , jsonpCallbackName: 'reqwest_foo'
        , data: { foo: 'bar', boo: 'baz', echo: true }
        , success: function (resp) {
            ok(resp && resp.query, 'received response from echo callback')
            ok(
                resp && resp.query && resp.query.callback == 'reqwest_foo'
              , 'correctly matched callback in URL'
            )
            complete()
          }
      })
    })
  })

  sink('Callbacks', function (test, ok) {

    test('sync version', function (done) {
      var r = ajax({
        method: 'get'
      , url: '/tests/fixtures/fixtures.json'
      , type: 'json'
      , async: false
      })
      ok(eval('(' + r.request.response + ')').boosh == 'boosh', 'can make sync calls')
      done()
    })

    test('no callbacks', function (complete) {
      var pass = true
      try {
        ajax('/tests/fixtures/fixtures.js')
      } catch (ex) {
        pass = false
      } finally {
        ok(pass, 'successfully doesnt fail without callback')
        complete()
      }
    })

    test('complete is called', function (complete) {
      ajax({
          url: '/tests/fixtures/fixtures.js'
        , complete: function () {
            ok(true, 'called complete')
            complete()
          }
      })
    })

    test('invalid JSON sets error on resp object', function (complete) {
      ajax({
          url: '/tests/fixtures/invalidJSON.json'
        , type: 'json'
        , success: function () {
            ok(false, 'success callback fired')
            complete()
          }
        , error: function (resp, msg) {
            ok(
                msg == 'Could not parse JSON in response'
              , 'error callback fired'
            )
            complete()
          }
      })
    })

    test('multiple parallel named JSONP callbacks', 8, function () {
      ajax({
          url: '/tests/fixtures/fixtures_jsonp_multi.jsonp?callback=reqwest_0'
        , type: 'jsonp'
        , success: function (resp) {
            ok(resp, 'received response from call #1')
            ok(
                resp && resp.a == 'a'
              , 'evaluated response from call #1 as JSONP'
            )
          }
      })
      ajax({
          url: '/tests/fixtures/fixtures_jsonp_multi_b.jsonp?callback=reqwest_0'
        , type: 'jsonp'
        , success: function (resp) {
            ok(resp, 'received response from call #2')
            ok(
                resp && resp.b == 'b'
              , 'evaluated response from call #2 as JSONP'
            )
          }
      })
      ajax({
          url: '/tests/fixtures/fixtures_jsonp_multi_c.jsonp?callback=reqwest_0'
        , type: 'jsonp'
        , success: function (resp) {
            ok(resp, 'received response from call #2')
            ok(
                resp && resp.c == 'c'
              , 'evaluated response from call #3 as JSONP'
            )
          }
      })
      ajax({
          url: '/tests/fixtures/fixtures_jsonp_multi.jsonp?callback=reqwest_0'
        , type: 'jsonp'
        , success: function (resp) {
            ok(resp, 'received response from call #2')
            ok(
                resp && resp.a == 'a'
              , 'evaluated response from call #4 as JSONP'
            )
          }
      })
    })

    test('JSONP also supports success promises', function (complete) {
      ajax({
          url: '/tests/none.jsonp?echo'
        , type: 'jsonp'
        , success: function (resp) {
            ok(resp, 'received response in constructor success callback')
          }
      })
        .then(function (resp) {
            ok(resp, 'received response in promise success callback')
        })
        .then(function (resp) {
            ok(resp, 'received response in second promise success callback')
            complete()
        })
    })

    test('JSONP also supports error promises', function (complete) {
      ajax({
          url: '/tests/timeout/'
        , type: 'jsonp'
        , error: function (err) {
            ok(err, 'received error response in constructor error callback')
          }
      })
        .fail(function (err) {
            ok(err, 'received error response in promise error callback')
        })
        .fail(function (err) {
            ok(err, 'received error response in second promise error callback')
            complete()
        })
        .abort()
    })

  })

  if (window.XMLHttpRequest
    && ('withCredentials' in new window.XMLHttpRequest())) {

    sink('Cross-origin Resource Sharing', function (test, ok) {
      test('make request to another origin', 1, function () {
        ajax({
            url: 'http://' + window.location.hostname + ':5678/get-value'
          , type: 'text'
          , method: 'get'
          , crossOrigin: true
          , complete: function (resp) {
              ok(resp.responseText === 'hello', 'request made successfully')
            }
        })
      })

      test('set cookie on other origin', 2, function () {
        ajax({
            url: 'http://' + window.location.hostname + ':5678/set-cookie'
          , type: 'text'
          , method: 'get'
          , crossOrigin: true
          , withCredentials: true
          , before: function (http) {
              ok(
                  http.withCredentials === true
                , 'has set withCredentials on connection object'
              )
            }
          , complete: function (resp) {
              ok(resp.status === 200, 'cookie set successfully')
            }
        })
      })

      test('get cookie from other origin', 1, function () {
        ajax({
              url: 'http://'
                  + window.location.hostname
                  + ':5678/get-cookie-value'
            , type: 'text'
            , method: 'get'
            , crossOrigin: true
            , withCredentials: true
            , complete: function (resp) {
                ok(
                    resp.responseText == 'hello'
                  , 'cookie value retrieved successfully'
                )
              }
        })
      })

    })
  }

  sink('Connection Object', function (test, ok) {

    test('setRequestHeaders', function (complete) {
      ajax({
          url: '/tests/fixtures/fixtures.html'
        , data: 'foo=bar&baz=thunk'
        , method: 'post'
        , headers: {
            'Accept': 'application/x-foo'
          }
        , success: function () {
            ok(true, 'can post headers')
            complete()
          }
      })
    })

    test('can inspect http before send', function (complete) {
      var connection = ajax({
          url: '/tests/fixtures/fixtures.js'
        , method: 'post'
        , type: 'js'
        , before: function (http) {
            ok(http.readyState == 1, 'received http connection object')
          }
        , success: function () {
            // Microsoft.XMLHTTP appears not to run this async in IE6&7, it
            // processes the request and triggers success() before ajax() even
            // returns. Perhaps a better solution would be to defer the calls
            // within handleReadyState()
            setTimeout(function () {
              ok(
                  connection.request.readyState == 4
                , 'success callback has readyState of 4'
              )
              complete()
            }, 0)
        }
      })
    })

    test('ajax() encodes array `data`', function (complete) {
      FakeXHR.setup()
      try {
       ajax({
            url: '/tests/fixtures/fixtures.html'
          , method: 'post'
          , data: [
                { name: 'foo', value: 'bar' }
              , { name: 'baz', value: 'thunk' }
            ]
        })
        ok(FakeXHR.last.methodCallCount('send') == 1, 'send called')
        ok(
            FakeXHR.last.methodCallArgs('send', 0).length == 1
          , 'send called with 1 arg'
        )
        ok(
            FakeXHR.last.methodCallArgs('send', 0, 0) == 'foo=bar&baz=thunk'
          , 'send called with encoded array'
        )
        complete()
      } finally {
        FakeXHR.restore()
      }
    })

    test('ajax() encodes hash `data`', function (complete) {
      FakeXHR.setup()
      try {
        ajax({
            url: '/tests/fixtures/fixtures.html'
          , method: 'post'
          , data: { bar: 'foo', thunk: 'baz' }
        })
        ok(FakeXHR.last.methodCallCount('send') == 1, 'send called')
        ok(
            FakeXHR.last.methodCallArgs('send', 0).length == 1
          , 'send called with 1 arg'
        )
        ok(
            FakeXHR.last.methodCallArgs('send', 0, 0) == 'bar=foo&thunk=baz'
          , 'send called with encoded array'
        )
        complete()
      } finally {
        FakeXHR.restore()
      }
    })

    test('ajax() obeys `processData`', function (complete) {
      FakeXHR.setup()
      try {
        var d = { bar: 'foo', thunk: 'baz' }
        ajax({
            url: '/tests/fixtures/fixtures.html'
          , processData: false
          , method: 'post'
          , data: d
        })
        ok(FakeXHR.last.methodCallCount('send') == 1, 'send called')
        ok(
            FakeXHR.last.methodCallArgs('send', 0).length == 1
          , 'send called with 1 arg'
        )
        ok(
            FakeXHR.last.methodCallArgs('send', 0, 0) === d
          , 'send called with exact `data` object'
        )
        complete()
      } finally {
        FakeXHR.restore()
      }
    })

    function testXhrGetUrlAdjustment(url, data, expectedUrl, complete) {
      FakeXHR.setup()
      try {
        ajax({ url: url, data: data })
        ok(FakeXHR.last.methodCallCount('open') == 1, 'open called')
        ok(
            FakeXHR.last.methodCallArgs('open', 0).length == 3
          , 'open called with 3 args'
        )
        ok(
            FakeXHR.last.methodCallArgs('open', 0, 0) == 'GET'
          , 'first arg of open() is "GET"'
        )
        ok(FakeXHR.last.methodCallArgs('open', 0, 1) == expectedUrl
          , 'second arg of open() is URL with query string')
        ok(
            FakeXHR.last.methodCallArgs('open', 0, 2) === true
          , 'third arg of open() is `true`'
        )
        ok(FakeXHR.last.methodCallCount('send') == 1, 'send called')
        ok(
            FakeXHR.last.methodCallArgs('send', 0).length == 1
          , 'send called with 1 arg'
        )
        ok(
            FakeXHR.last.methodCallArgs('send', 0, 0) === null
          , 'send called with null'
        )
        complete()
      } finally {
        FakeXHR.restore()
      }
    }

    test('ajax() appends GET URL with ?`data`', function (complete) {
      testXhrGetUrlAdjustment(
          '/tests/fixtures/fixtures.html'
        , 'bar=foo&thunk=baz'
        , '/tests/fixtures/fixtures.html?bar=foo&thunk=baz'
        , complete
      )
    })

    test('ajax() appends GET URL with ?`data` (serialized object)'
          , function (complete) {

      testXhrGetUrlAdjustment(
          '/tests/fixtures/fixtures.html'
        , { bar: 'foo', thunk: 'baz' }
        , '/tests/fixtures/fixtures.html?bar=foo&thunk=baz'
        , complete
      )
    })

    test('ajax() appends GET URL with &`data` (serialized array)'
          , function (complete) {

      testXhrGetUrlAdjustment(
          '/tests/fixtures/fixtures.html?x=y'
        , [ { name: 'bar', value: 'foo'}, {name: 'thunk', value: 'baz' } ]
        , '/tests/fixtures/fixtures.html?x=y&bar=foo&thunk=baz'
        , complete
      )
    })
  })

  sink('Standard vs compat mode', function (test, ok) {
    function methodMatch(resp, method) {
       return resp && resp.method === method
    }
    function headerMatch(resp, key, expected) {
      return resp && resp.headers && resp.headers[key] === expected
    }
    function queryMatch(resp, key, expected) {
      return resp && resp.query && resp.query[key] === expected
    }

    test('standard mode default', function (complete) {
      ajax({
          url: '/tests/none.json?echo'
        , success: function (resp) {
            ok(methodMatch(resp, 'GET'), 'correct request method (GET)')
            ok(
                headerMatch(
                    resp
                  , 'content-type'
                  , 'application/x-www-form-urlencoded'
                )
              , 'correct Content-Type request header'
            )
            ok(
                headerMatch(resp, 'x-requested-with', 'XMLHttpRequest')
              , 'correct X-Requested-With header'
            )
            ok(
                headerMatch(
                    resp
                  , 'accept'
                  , 'text/javascript, text/html, application/xml, text/xml, */*'
                )
              , 'correct Accept header'
            )
            complete()
          }
      })
    })

    test('standard mode custom content-type', function (complete) {
      ajax({
          url: '/tests/none.json?echo'
        , contentType: 'yapplication/foobar'
        , success: function (resp) {
            ok(methodMatch(resp, 'GET'), 'correct request method (GET)')
            ok(
                headerMatch(resp, 'content-type', 'yapplication/foobar')
              , 'correct Content-Type request header'
            )
            ok(
                headerMatch(resp, 'x-requested-with', 'XMLHttpRequest')
              , 'correct X-Requested-With header'
            )
            ok(
                headerMatch(
                    resp
                  , 'accept'
                  , 'text/javascript, text/html, application/xml, text/xml, */*'
                )
              , 'correct Accept header'
            )
            complete()
          }
      })
    })

    test('compat mode "dataType=json" headers', function (complete) {
      ajax.compat({
          url: '/tests/none.json?echo'
        , dataType: 'json' // should map to 'type'
        , success: function (resp) {
            ok(methodMatch(resp, 'GET'), 'correct request method (GET)')
            ok(
                headerMatch(
                    resp
                  , 'content-type'
                  , 'application/x-www-form-urlencoded'
                )
              , 'correct Content-Type request header'
            )
            ok(
                headerMatch(resp, 'x-requested-with', 'XMLHttpRequest')
              , 'correct X-Requested-With header'
            )
            ok(
                headerMatch(resp, 'accept', 'application/json, text/javascript')
              , 'correct Accept header'
            )
            complete()
          }
      })
    })

    test('compat mode "dataType=json" with "type=post" headers'
        , function (complete) {
      ajax.compat({
          url: '/tests/none.json?echo'
        , type: 'post'
        , dataType: 'json' // should map to 'type'
        , success: function (resp) {
            ok(methodMatch(resp, 'POST'), 'correct request method (POST)')
            ok(
                headerMatch(
                    resp
                  , 'content-type'
                  , 'application/x-www-form-urlencoded'
                )
              , 'correct Content-Type request header'
            )
            ok(
                headerMatch(resp, 'x-requested-with', 'XMLHttpRequest')
              , 'correct X-Requested-With header'
            )
            ok(
                headerMatch(resp, 'accept', 'application/json, text/javascript')
              , 'correct Accept header'
            )
            complete()
          }
      })
    })

    test('compat mode "dataType=json" headers (with additional headers)'
        , function (complete) {

      ajax.compat({
          url: '/tests/none.json?echo'
        , dataType: 'json' // should map to 'type'
          // verify that these are left intact and nothing screwy
          // happens with headers
        , headers: { one: 1, two: 2 }
        , success: function (resp) {
            ok(
                headerMatch(
                    resp
                  , 'content-type'
                  , 'application/x-www-form-urlencoded'
                )
              , 'correct Content-Type request header'
            )
            ok(
                headerMatch(resp, 'x-requested-with', 'XMLHttpRequest')
              , 'correct X-Requested-With header'
            )
            ok(
                headerMatch(resp, 'accept', 'application/json, text/javascript')
              , 'correct Accept header'
            )
            ok(
                headerMatch(resp, 'one', '1') && headerMatch(resp, 'two', '2')
              , 'left additional headers intact'
            )
            complete()
          }
      })
    })

    test('compat mode "dataType=jsonp" query string', function (complete) {
      ajax.compat({
          url: '/tests/none.jsonp?echo'
        , dataType: 'jsonp'
        , jsonp: 'testCallback' // should map to jsonpCallback
        , jsonpCallback: 'foobar' // should map to jsonpCallbackName
        , success: function (resp) {
            ok(
                queryMatch(resp, 'echo', '')
              , 'correct Content-Type request header'
            )
            ok(
                queryMatch(resp, 'testCallback', 'foobar')
              , 'correct X-Requested-With header'
            )
            complete()
          }
      })
    })
  })

  /***************** SERIALIZER TESTS ***********************/

  // define some helpers for the serializer tests that are used often and
  // shared with the ender integration tests

  function createSerializeHelper(ok) {
    var forms = document.forms
      , foo = forms[0].getElementsByTagName('input')[1]
      , bar = forms[0].getElementsByTagName('input')[2]
      , choices = forms[0].getElementsByTagName('select')[0]
      , BIND_ARGS = 'bind'
      , PASS_ARGS = 'pass'

    function reset() {
      forms[1].reset()
    }

    function formElements(formIndex, tagName, elementIndex) {
      return forms[formIndex].getElementsByTagName(tagName)[elementIndex]
    }

    function isArray(a) {
      return Object.prototype.toString.call(a) == '[object Array]'
    }

    function sameValue(value, expected) {
      if (expected == null) {
        return value === null
      } else if (isArray(expected)) {
        if (value.length !== expected.length) return false
        for (var i = 0; i < expected.length; i++) {
          if (value[i] != expected[i]) return false
        }
        return true
      } else return value == expected
    }

    function testInput(input, name, value, str) {
      var sa = ajax.serialize(input, { type: 'array' })
        , sh = ajax.serialize(input, { type: 'map' })
        , av, i

      if (value != null) {
        av = isArray(value) ? value : [ value ]

        ok(
            sa.length == av.length
          ,   'serialize(' + str + ', {type:\'array\'}) returns array '
            + '[{name,value}]'
        )

        for (i = 0; i < av.length; i++) {
          ok(
              name == sa[i].name
            , 'serialize(' + str + ', {type:\'array\'})[' + i + '].name'
          )
          ok(
              av[i] == sa[i].value
            , 'serialize(' + str + ', {type:\'array\'})[' + i + '].value'
          )
        }

        ok(sameValue(sh[name], value), 'serialize(' + str + ', {type:\'map\'})')
      } else {
        // the cases where an element shouldn't show up at all, checkbox not
        // checked for example
        ok(sa.length === 0, 'serialize(' + str + ', {type:\'array\'}) is []')
        ok(
            v.keys(sh).length === 0
          , 'serialize(' + str + ', {type:\'map\'}) is {}'
        )
      }
    }

    function testFormSerialize(method, type) {
      var expected =
            'foo=bar&bar=baz&wha=1&wha=3&who=tawoo&%24escapable+name'
          + '%24=escapeme&choices=two&opinions=world+peace+is+not+real'

      ok(method, 'serialize() bound to context')
      ok(
          (method ? method(forms[0]) : null) == expected
        , 'serialized form (' + type + ')'
      )
    }

    function executeMultiArgumentMethod(method, argType, options) {
      var els = [ foo, bar, choices ]
        , ths = argType === BIND_ARGS ? ender(els) : null
        , args = argType === PASS_ARGS ? els : []

      if (!!options) args.push(options)

      return method.apply(ths, args)
    }

    function testMultiArgumentSerialize(method, type, argType) {
      ok(method, 'serialize() bound in context')
      var result = method ? executeMultiArgumentMethod(method, argType) : null
      ok(
          result == 'foo=bar&bar=baz&choices=two'
        , 'serialized all 3 arguments together'
      )
    }

    function verifyFormSerializeArray(result, type) {
      var expected = [
              { name: 'foo', value: 'bar' }
            , { name: 'bar', value: 'baz' }
            , { name: 'wha', value: 1 }
            , { name: 'wha', value: 3 }
            , { name: 'who', value: 'tawoo' }
            , { name: '$escapable name$', value: 'escapeme' }
            , { name: 'choices', value: 'two' }
            , { name: 'opinions', value: 'world peace is not real' }
          ]
        , i

    for (i = 0; i < expected.length; i++) {
        ok(v.some(result, function (v) {
          return v.name == expected[i].name && v.value == expected[i].value
        }), 'serialized ' + expected[i].name + ' (' + type + ')')
      }
    }

    function testFormSerializeArray(method, type) {
      ok(method, 'serialize(..., {type:\'array\'}) bound to context')

      var result = method ? method(forms[0], { type: 'array' }) : []
      if (!result) result = []

      verifyFormSerializeArray(result, type)
    }

    function testMultiArgumentSerializeArray(method, type, argType) {
        ok(method, 'serialize(..., {type:\'array\'}) bound to context')
        var result = method
          ? executeMultiArgumentMethod(method, argType, { type: 'array' })
          : []

        if (!result) result = []

        ok(result.length == 3, 'serialized as array of 3')
        ok(
            result.length == 3
            && result[0].name == 'foo'
            && result[0].value == 'bar'
          , 'serialized first element (' + type + ')'
        )
        ok(
            result.length == 3
            && result[1].name == 'bar'
            && result[1].value == 'baz'
          , 'serialized second element (' + type + ')'
        )
        ok(
            result.length == 3
            && result[2].name == 'choices'
            && result[2].value == 'two'
          , 'serialized third element (' + type + ')'
        )
      }

    function testFormSerializeHash(method, type) {
      var expected = {
              foo: 'bar'
            , bar: 'baz'
            , wha: [ '1', '3' ]
            , who: 'tawoo'
            , '$escapable name$': 'escapeme'
            , choices: 'two'
            , opinions: 'world peace is not real'
          }
        , result

      ok(method, 'serialize({type:\'map\'}) bound to context')

      result = method ? method(forms[0], { type: 'map' }) : {}
      if (!result) result = {}

      ok(
          v.keys(expected).length === v.keys(result).length
        , 'same number of keys (' + type + ')'
      )

      v.each(v.keys(expected), function (k) {
        ok(
            sameValue(expected[k], result[k])
          , 'same value for ' + k + ' (' + type + ')'
        )
      })
    }

    function testMultiArgumentSerializeHash(method, type, argType) {
      ok(method, 'serialize({type:\'map\'}) bound to context')
      var result = method
        ? executeMultiArgumentMethod(method, argType, { type: 'map' })
        : {}
      if (!result) result = {}
      ok(result.foo == 'bar', 'serialized first element (' + type + ')')
      ok(result.bar == 'baz', 'serialized second element (' + type + ')')
      ok(result.choices == 'two', 'serialized third element (' + type + ')')
    }

    return {
      reset: reset
      , formElements: formElements
      , testInput: testInput
      , testFormSerialize: testFormSerialize
      , testMultiArgumentSerialize: testMultiArgumentSerialize
      , testFormSerializeArray: testFormSerializeArray
      , verifyFormSerializeArray: verifyFormSerializeArray
      , testMultiArgumentSerializeArray: testMultiArgumentSerializeArray
      , testFormSerializeHash: testFormSerializeHash
      , testMultiArgumentSerializeHash: testMultiArgumentSerializeHash
    }
  }

  sink('Serializing', function (test, ok) {

    /*
     * Serialize forms according to spec.
     *  * reqwest.serialize(ele[, ele...]) returns a query string style
     *    serialization
     *  * reqwest.serialize(ele[, ele...], {type:'array'}) returns a
     *    [ { name: 'name', value: 'value'}, ... ] style serialization,
     *    compatible with jQuery.serializeArray()
     *  * reqwest.serialize(ele[, ele...], {type:\'map\'}) returns a
     *    { 'name': 'value', ... } style serialization, compatible with
     *    Prototype Form.serializeElements({hash:true})
     * Some tests based on spec notes here:
     *    http://malsup.com/jquery/form/comp/test.html
     */

    var sHelper = createSerializeHelper(ok)
    sHelper.reset()

    test('correctly serialize textarea', function (complete) {
      var textarea = sHelper.formElements(1, 'textarea', 0)
        , sa

      // the texarea has 2 different newline styles, should come out as
      // normalized CRLF as per forms spec
      ok(
          'T3=%3F%0D%0AA+B%0D%0AZ' == ajax.serialize(textarea)
        , 'serialize(textarea)'
      )
      sa = ajax.serialize(textarea, { type: 'array' })
      ok(sa.length == 1, 'serialize(textarea, {type:\'array\'}) returns array')
      sa = sa[0]
      ok('T3' == sa.name, 'serialize(textarea, {type:\'array\'}).name')
      ok(
          '?\r\nA B\r\nZ' == sa.value
        , 'serialize(textarea, {type:\'array\'}).value'
      )
      ok(
          '?\r\nA B\r\nZ' == ajax.serialize(textarea, { type: 'map' }).T3
        , 'serialize(textarea, {type:\'map\'})'
      )
      complete()
    })

    test('correctly serialize input[type=hidden]', function (complete) {
      sHelper.testInput(
          sHelper.formElements(1, 'input', 0)
        , 'H1'
        , 'x'
        , 'hidden'
      )
      sHelper.testInput(
          sHelper.formElements(1, 'input', 1)
        , 'H2'
        , ''
        , 'hidden[no value]'
      )
      complete()
    })

    test('correctly serialize input[type=password]', function (complete) {
      sHelper.testInput(
          sHelper.formElements(1, 'input', 2)
        , 'PWD1'
        , 'xyz'
        , 'password'
      )
      sHelper.testInput(
          sHelper.formElements(1, 'input', 3)
        , 'PWD2'
        , ''
        , 'password[no value]'
      )
      complete()
    })

    test('correctly serialize input[type=text]', function (complete) {
      sHelper.testInput(
          sHelper.formElements(1, 'input', 4)
        , 'T1'
        , ''
        , 'text[no value]'
      )
      sHelper.testInput(
          sHelper.formElements(1, 'input', 5)
        , 'T2'
        , 'YES'
        , 'text[readonly]'
      )
      sHelper.testInput(
          sHelper.formElements(1, 'input', 10)
        , 'My Name'
        , 'me'
        , 'text[space name]'
      )
      complete()
    })

    test('correctly serialize input[type=checkbox]', function (complete) {
      var cb1 = sHelper.formElements(1, 'input', 6)
        , cb2 = sHelper.formElements(1, 'input', 7)
      sHelper.testInput(cb1, 'C1', null, 'checkbox[not checked]')
      cb1.checked = true
      sHelper.testInput(cb1, 'C1', '1', 'checkbox[checked]')
      // special case here, checkbox with no value='' should give you 'on'
      // for cb.value
      sHelper.testInput(cb2, 'C2', null, 'checkbox[no value, not checked]')
      cb2.checked = true
      sHelper.testInput(cb2, 'C2', 'on', 'checkbox[no value, checked]')
      complete()
    })

    test('correctly serialize input[type=radio]', function (complete) {
      var r1 = sHelper.formElements(1, 'input', 8)
        , r2 = sHelper.formElements(1, 'input', 9)
      sHelper.testInput(r1, 'R1', null, 'radio[not checked]')
      r1.checked = true
      sHelper.testInput(r1, 'R1', '1', 'radio[not checked]')
      sHelper.testInput(r2, 'R1', null, 'radio[no value, not checked]')
      r2.checked = true
      sHelper.testInput(r2, 'R1', '', 'radio[no value, checked]')
      complete()
    })

    test('correctly serialize input[type=reset]', function (complete) {
      sHelper.testInput(
          sHelper.formElements(1, 'input', 11)
        , 'rst'
        , null
        , 'reset'
      )
      complete()
    })

    test('correctly serialize input[type=file]', function (complete) {
      sHelper.testInput(
          sHelper.formElements(1, 'input', 12)
        , 'file'
        , null
        , 'file'
      )
      complete()
    })

    test('correctly serialize input[type=submit]', function (complete) {
      // we're only supposed to serialize a submit button if it was clicked to
      // perform this serialization:
      // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2
      // but we'll pretend to be oblivious to this part of the spec...
      sHelper.testInput(
          sHelper.formElements(1, 'input', 13)
        , 'sub'
        , 'NO'
        , 'submit'
      )
      complete()
    })

    test('correctly serialize select with no options', function (complete) {
      var select = sHelper.formElements(1, 'select', 0)
      sHelper.testInput(select, 'S1', null, 'select, no options')
      complete()
    })

    test('correctly serialize select with values', function (complete) {
      var select = sHelper.formElements(1, 'select', 1)
      sHelper.testInput(select, 'S2', 'abc', 'select option 1 (default)')
      select.selectedIndex = 1
      sHelper.testInput(select, 'S2', 'def', 'select option 2')
      select.selectedIndex = 6
      sHelper.testInput(select, 'S2', 'disco stu', 'select option 7')
      // a special case where we have <option value=''>X</option>, should
      // return '' rather than X which will happen if you just do a simple
      // `value=(option.value||option.text)`
      select.selectedIndex = 9
      sHelper.testInput(
          select
        , 'S2'
        , ''
        , 'select option 9, value="" should yield ""'
      )
      select.selectedIndex = -1
      sHelper.testInput(select, 'S2', null, 'select, unselected')
      complete()
    })

    test('correctly serialize select without explicit values'
        , function (complete) {

      var select = sHelper.formElements(1, 'select', 2)
      sHelper.testInput(select, 'S3', 'ABC', 'select option 1 (default)')
      select.selectedIndex = 1
      sHelper.testInput(select, 'S3', 'DEF', 'select option 2')
      select.selectedIndex = 6
      sHelper.testInput(select, 'S3', 'DISCO STU!', 'select option 7')
      select.selectedIndex = -1
      sHelper.testInput(select, 'S3', null, 'select, unselected')
      complete()
    })

    test('correctly serialize select multiple', function (complete) {
      var select = sHelper.formElements(1, 'select', 3)
      sHelper.testInput(select, 'S4', null, 'select, unselected (default)')
      select.options[1].selected = true
      sHelper.testInput(select, 'S4', '2', 'select option 2')
      select.options[3].selected = true
      sHelper.testInput(select, 'S4', [ '2', '4' ], 'select options 2 & 4')
      select.options[8].selected = true
      sHelper.testInput(
          select
        , 'S4'
        , [ '2', '4', 'Disco Stu!' ]
        , 'select option 2 & 4 & 9'
      )
      select.options[3].selected = false
      sHelper.testInput(
          select
        , 'S4'
        , [ '2', 'Disco Stu!' ]
        , 'select option 2 & 9'
      )
      select.options[1].selected = false
      select.options[8].selected = false
      sHelper.testInput(select, 'S4', null, 'select, all unselected')
      complete()
     })

    test('correctly serialize options', function (complete) {
      var option = sHelper.formElements(1, 'select', 1).options[6]
      sHelper.testInput(
          option
        , '-'
        , null
        , 'just option (with value), shouldn\'t serialize'
      )

      option = sHelper.formElements(1, 'select', 2).options[6]
      sHelper.testInput(
          option
        , '-'
        , null
        , 'option (without value), shouldn\'t serialize'
      )

      complete()
    })

    test('correctly serialize disabled', function (complete) {
      var input = sHelper.formElements(1, 'input', 14)
        , select

      sHelper.testInput(input, 'D1', null, 'disabled text input')
      input = sHelper.formElements(1, 'input', 15)
      sHelper.testInput(input, 'D2', null, 'disabled checkbox')
      input = sHelper.formElements(1, 'input', 16)
      sHelper.testInput(input, 'D3', null, 'disabled radio')

      select = sHelper.formElements(1, 'select', 4)
      sHelper.testInput(select, 'D4', null, 'disabled select')
      select = sHelper.formElements(1, 'select', 3)
      sHelper.testInput(select, 'D5', null, 'disabled select option')
      select = sHelper.formElements(1, 'select', 6)
      sHelper.testInput(select, 'D6', null, 'disabled multi select')
      select = sHelper.formElements(1, 'select', 7)
      sHelper.testInput(select, 'D7', null, 'disabled multi select option')
      complete()
    })

    test('serialize(form)', function (complete) {
      sHelper.testFormSerialize(ajax.serialize, 'direct')
      complete()
    })

    test('serialize(form, {type:\'array\'})', function (complete) {
      sHelper.testFormSerializeArray(ajax.serialize, 'direct')
      complete()
    })

    test('serialize(form, {type:\'map\'})', function (complete) {
      sHelper.testFormSerializeHash(ajax.serialize, 'direct')
      complete()
    })

    // mainly for Ender integration, so you can do this:
    // $('input[name=T2],input[name=who],input[name=wha]').serialize()
    test('serialize(element, element, element...)', function (complete) {
      sHelper.testMultiArgumentSerialize(ajax.serialize, 'direct', PASS_ARGS)
      complete()
    })

    // mainly for Ender integration, so you can do this:
    // $('input[name=T2],input[name=who],input[name=wha]')
    //    .serialize({type:'array'})
    test('serialize(element, element, element..., {type:\'array\'})'
        , function (complete) {
      sHelper.testMultiArgumentSerializeArray(
          ajax.serialize
        , 'direct'
        , PASS_ARGS
      )
      complete()
    })

    // mainly for Ender integration, so you can do this:
    // $('input[name=T2],input[name=who],input[name=wha]')
    //     .serialize({type:'map'})
    test('serialize(element, element, element...)', function (complete) {
      sHelper.testMultiArgumentSerializeHash(
          ajax.serialize
        , 'direct'
        , PASS_ARGS
      )
      complete()
    })

    test('toQueryString([{ name: x, value: y }, ... ]) name/value array'
        , function (complete) {

      var arr = [
          { name: 'foo', value: 'bar' }
        , { name: 'baz', value: '' }
        , { name: 'x', value: -20 }
        , { name: 'x', value: 20 }
      ]

      ok(ajax.toQueryString(arr) == 'foo=bar&baz=&x=-20&x=20', 'simple')

      arr = [
          { name: 'dotted.name.intact', value: '$@%' }
        , { name: '$ $', value: 20 }
        , { name: 'leave britney alone', value: 'waa haa haa' }
      ]

      ok(
          ajax.toQueryString(arr) ==
              'dotted.name.intact=%24%40%25&%24+%24=20'
            + '&leave+britney+alone=waa+haa+haa'
        , 'escaping required'
      )

      complete()
    })

    test('toQueryString({name: value,...} complex object', function (complete) {
      var obj = { 'foo': 'bar', 'baz': '', 'x': -20 }

      ok(ajax.toQueryString(obj) == 'foo=bar&baz=&x=-20', 'simple')

      obj = {
          'dotted.name.intact': '$@%'
        , '$ $': 20
        , 'leave britney alone': 'waa haa haa'
      }
      ok(
          ajax.toQueryString(obj) ==
              'dotted.name.intact=%24%40%25&%24+%24=20'
            + '&leave+britney+alone=waa+haa+haa'
        , 'escaping required'
      )

      complete()
    })

    test('toQueryString({name: [ value1, value2 ...],...} object with arrays', function (complete) {
      var obj = { 'foo': 'bar', 'baz': [ '', '', 'boo!' ], 'x': [ -20, 2.2, 20 ] }
      ok(ajax.toQueryString(obj, true) == "foo=bar&baz=&baz=&baz=boo!&x=-20&x=2.2&x=20", "object with arrays")
      ok(ajax.toQueryString(obj) == "foo=bar&baz%5B%5D=&baz%5B%5D=&baz%5B%5D=boo!&x%5B%5D=-20&x%5B%5D=2.2&x%5B%5D=20")
      complete()
    })

    test('toQueryString({name: { nestedName: value },...} object with objects', function(complete) {
      var obj = { 'foo': { 'bar': 'baz' }, 'x': [ { 'bar': 'baz' }, { 'boo': 'hiss' } ] }
      ok(ajax.toQueryString(obj) == "foo%5Bbar%5D=baz&x%5B0%5D%5Bbar%5D=baz&x%5B1%5D%5Bboo%5D=hiss", "object with objects")
      complete()
    })

  })

  sink('Ender Integration', function (test, ok) {
    var sHelper = createSerializeHelper(ok)
    sHelper.reset()

    test('$.ajax alias for reqwest, not bound to boosh', 1, function () {
      ok(ender.ajax === ajax, '$.ajax is reqwest')
    })

    // sHelper.test that you can do $.serialize(form)
    test('$.serialize(form)', function (complete) {
      sHelper.testFormSerialize(ender.serialize, 'ender')
      complete()
    })

    // sHelper.test that you can do $.serialize(form)
    test('$.serialize(form, {type:\'array\'})', function (complete) {
      sHelper.testFormSerializeArray(ender.serialize, 'ender')
      complete()
    })

    // sHelper.test that you can do $.serialize(form)
    test('$.serialize(form, {type:\'map\'})', function (complete) {
      sHelper.testFormSerializeHash(ender.serialize, 'ender')
      complete()
    })

    // sHelper.test that you can do $.serializeObject(form)
    test('$.serializeArray(...) alias for serialize(..., {type:\'map\'}'
        , function (complete) {
      sHelper.verifyFormSerializeArray(
          ender.serializeArray(document.forms[0])
        , 'ender'
      )
      complete()
    })

    test('$.serialize(element, element, element...)', function (complete) {
      sHelper.testMultiArgumentSerialize(ender.serialize, 'ender', PASS_ARGS)
      complete()
    })

    test('$.serialize(element, element, element..., {type:\'array\'})'
        , function (complete) {
      sHelper.testMultiArgumentSerializeArray(
          ender.serialize
        , 'ender'
        , PASS_ARGS
      )
      complete()
    })

    test('$.serialize(element, element, element..., {type:\'map\'})'
        , function (complete) {
      sHelper.testMultiArgumentSerializeHash(
          ender.serialize
        , 'ender'
        , PASS_ARGS
      )
      complete()
    })

    test('$(element, element, element...).serialize()', function (complete) {
      sHelper.testMultiArgumentSerialize(ender.fn.serialize, 'ender', BIND_ARGS)
      complete()
    })

    test('$(element, element, element...).serialize({type:\'array\'})'
        , function (complete) {
      sHelper.testMultiArgumentSerializeArray(
          ender.fn.serialize
        , 'ender'
        , BIND_ARGS
      )
      complete()
    })

    test('$(element, element, element...).serialize({type:\'map\'})'
        , function (complete) {
      sHelper.testMultiArgumentSerializeHash(
          ender.fn.serialize
        , 'ender'
        , BIND_ARGS
      )
      complete()
    })

    test('$.toQueryString alias for reqwest.toQueryString, not bound to boosh'
          , function (complete) {
      ok(
          ender.toQueryString === ajax.toQueryString
        , '$.toQueryString is reqwest.toQueryString'
      )
      complete()
    })
  })


  /**
   * Promise tests for `then` `fail` and `always`
   */
  sink('Promises', function (test, ok) {

    test('always callback is called', function (complete) {
      ajax({
        url: '/tests/fixtures/fixtures.js'
      })
        .always(function () {
          ok(true, 'called complete')
          complete()
        })
    })

    test('success and error handlers are called', 3, function () {
      ajax({
          url: '/tests/fixtures/invalidJSON.json'
        , type: 'json'
      })
        .then(
            function () {
              ok(false, 'success callback fired')
            }
          , function (resp, msg) {
              ok(
                  msg == 'Could not parse JSON in response'
                , 'error callback fired'
              )
            }
        )

      ajax({
          url: '/tests/fixtures/invalidJSON.json'
        , type: 'json'
      })
        .fail(function (resp, msg) {
          ok(msg == 'Could not parse JSON in response', 'fail callback fired')
        })

      ajax({
          url: '/tests/fixtures/fixtures.json'
        , type: 'json'
      })
        .then(
            function () {
              ok(true, 'success callback fired')
            }
          , function () {
              ok(false, 'error callback fired')
            }
        )
    })

    test('then & always handlers can be added after a response is received'
          , 2
          , function () {

      var a = ajax({
          url: '/tests/fixtures/fixtures.json'
        , type: 'json'
      })
        .always(function () {
          setTimeout(function () {
            a.then(
                  function () {
                    ok(true, 'success callback called')
                  }
                , function () {
                    ok(false, 'error callback called')
                  }
              ).always(function () {
                ok(true, 'complete callback called')
              })
          }, 1)
        })
    })

    test('failure handlers can be added after a response is received'
        , function (complete) {

      var a = ajax({
          url: '/tests/fixtures/invalidJSON.json'
        , type: 'json'
      })
        .always(function () {
          setTimeout(function () {
            a
              .fail(function () {
                ok(true, 'fail callback called')
                complete()
              })
          }, 1)
        })
    })

    test('.then success and fail are optional parameters', 1, function () {
      try {
        ajax({
            url: '/tests/fixtures/invalidJSON.json'
          , type: 'json'
        })
          .then()
      } catch (ex) {
        ok(false, '.then() parameters should be optional')
      } finally {
        ok(true, 'passed .then() optional parameters')
      }
    })

  })



  sink('Timeout', function (test, ok) {
    test('xmlHttpRequest', function (complete) {
      var ts = +new Date()
      ajax({
          url: '/tests/timeout'
        , type: 'json'
        , timeout: 250
        , error: function (err) {
            ok(err, 'received error response')
            try {
              ok(err && err.status === 0, 'correctly caught timeout')
            } catch (e) {
              ok(true, 'IE is a troll')
            }
            var tt = Math.abs(+new Date() - ts)
            ok(
                tt > 200 && tt < 300
              , 'timeout close enough to 250 (' + tt + ')'
            )
            complete()
          }
      })
    })

    test('jsonpRequest', function (complete) {
      var ts = +new Date()
      ajax({
          url: '/tests/timeout'
        , type: 'jsonp'
        , timeout: 250
        , error: function (err) {
            ok(err, 'received error response')
            var tt = Math.abs(+new Date() - ts)
            ok(
                tt > 200 && tt < 300
              , 'timeout close enough to 250 (' + tt + ')'
            )
            complete()
          }
      })
    })
  })

  start()

}(reqwest))
