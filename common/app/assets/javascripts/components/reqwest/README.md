# It's AJAX

All over again. Includes support for xmlHttpRequest, JSONP, CORS, and CommonJS Promises A.

The happs
---------

``` sh
$ git clone git://github.com/ded/reqwest.git reqwest
$ cd !$
$ npm install
$ make
```

API
---------

``` js
reqwest('path/to/html', function (resp) {
  qwery('#content').html(resp)
})
```

``` js
reqwest({
    url: 'path/to/html'
  , method: 'post'
  , data: { foo: 'bar', baz: 100 }
  , success: function (resp) {
      qwery('#content').html(resp)
    }
})
```

``` js
reqwest({
    url: 'path/to/html'
  , method: 'get'
  , data: { [ name: 'foo', value: 'bar' ], [ name: 'baz', value: 100 ] }
  , success: function (resp) {
      qwery('#content').html(resp)
    }
})
```

``` js
reqwest({
    url: 'path/to/json'
  , type: 'json'
  , method: 'post'
  , error: function (err) { }
  , success: function (resp) {
      qwery('#content').html(resp.content)
    }
})
```

``` js
reqwest({
    url: 'path/to/json'
  , type: 'json'
  , method: 'post'
  , contentType: 'application/json'
  , headers: {
      'X-My-Custom-Header': 'SomethingImportant'
    }
  , error: function (err) { }
  , success: function (resp) {
      qwery('#content').html(resp.content)
    }
})
```

``` js

// Uses XMLHttpRequest2 credentialled requests (cookies, HTTP basic auth) if supported

reqwest({
    url: 'path/to/json'
  , type: 'json'
  , method: 'post'
  , contentType: 'application/json'
  , crossOrigin: true
  , withCredentials: true
  , error: function (err) { }
  , success: function (resp) {
      qwery('#content').html(resp.content)
    }
})
```

``` js
reqwest({
    url: 'path/to/data.jsonp?callback=?'
  , type: 'jsonp'
  , success: function (resp) {
      qwery('#content').html(resp.content)
    }
})
```

``` js
reqwest({
    url: 'path/to/data.jsonp?foo=bar'
  , type: 'jsonp'
  , jsonpCallback: 'foo'
  , jsonpCallbackName: 'bar'
  , success: function (resp) {
      qwery('#content').html(resp.content)
    }
})
```

``` js
reqwest({
    url: 'path/to/data.jsonp?foo=bar'
  , type: 'jsonp'
  , jsonpCallback: 'foo'
  , success: function (resp) {
      qwery('#content').html(resp.content)
    }
  , complete: function (resp) {
      qwery('#hide-this').hide()
    }
})
```

## Promises

``` js
reqwest({
    url: 'path/to/data.jsonp?foo=bar'
  , type: 'jsonp'
  , jsonpCallback: 'foo'
})
  .then(function (resp) {
    qwery('#content').html(resp.content)
  }, function (err, msg) {
    qwery('#errors').html(msg)
  })
  .always(function (resp) {
    qwery('#hide-this').hide()
  })
```

``` js
reqwest({
    url: 'path/to/data.jsonp?foo=bar'
  , type: 'jsonp'
  , jsonpCallback: 'foo'
})
  .then(function (resp) {
    qwery('#content').html(resp.content)
  })
  .fail(function (err, msg) {
    qwery('#errors').html(msg)
  })
  .always(function (resp) {
    qwery('#hide-this').hide()
  })
```

``` js
var r = reqwest({
    url: 'path/to/data.jsonp?foo=bar'
  , type: 'jsonp'
  , jsonpCallback: 'foo'
  , success: function () {
      setTimeout(function () {
        r
          .then(function (resp) {
            qwery('#content').html(resp.content)
          }, function (err) { })
          .always(function (resp) {
             qwery('#hide-this').hide()
          })
      }, 15)
    }
})
```


The Tests
---------
    $ npm test

Browser support
---------------
  * IE6+
  * Chrome 1+
  * Safari 3+
  * Firefox 1+
  * Opera

Ender Support
-------------
Reqwest can be used as an [Ender](http://ender.no.de) module. Add it to your existing build as such:

    $ ender add reqwest

Use it as such:

``` js
$.ajax({ ... })
```

Serialize things:

``` js
$(form).serialize() // returns query string -> x=y&...
$(form).serialize({type:'array'}) // returns array name/value pairs -> [ { name: x, value: y}, ... ]
$(form).serialize({type:'map'}) // returns an object representation -> { x: y, ... }
$(form).serializeArray()
$.toQueryString({
    foo: 'bar'
  , baz: 'thunk'
}) // returns query string -> foo=bar&baz=thunk
```

Or, get a bit fancy:

``` js
$('#myform input[name=myradios]').serialize({type:'map'})['myradios'] // get the selected value
$('input[type=text],#specialthing').serialize() // turn any arbitrary set of form elements into a query string
```


RequireJs and Jam
------------------
Reqwest can also be used with RequireJs and can be installed via jam

```
jam install reqwest
```

```js
define(function(require){
  var reqwest = require('reqwest');
});
```


jQuery and Zepto Compatibility
------------------------------
There are some differences between the *Reqwest way* and the
*jQuery/Zepto way*.

### method ###
jQuery/Zepto use `type` to specify the request method while Reqwest uses
`method` and reserves `type` for the response data type.

### dataType ###
When using jQuery/Zepto you use the `dataType` option to specify the type
of data to expect from the server, Reqwest uses `type`. jQuery also can
also take a space-separated list of data types to specify the request,
response and response-conversion types but Reqwest uses the `type`
parameter to infer the response type and leaves conversion up to you.

### JSONP ###
Reqwest also takes optional `jsonpCallback` and `jsonpCallbackName`
options to specify the callback query-string key and the callback function
name respectively while jQuery uses `jsonp` and `jsonpCallback` for
these same options.


But fear not! If you must work the jQuery/Zepto way then Reqwest has
a wrapper that will remap these options for you:

```js
reqwest.compat({
    url: 'path/to/data.jsonp?foo=bar'
  , dataType: 'jsonp'
  , jsonp: 'foo'
  , jsonpCallback: 'bar'
  , success: function (resp) {
      qwery('#content').html(resp.content)
    }
})

// or from Ender:

$.ajax.compat({
  ...
})
```

If you want to install jQuery/Zepto compatibility mode as the default
then simply place this snippet at the top of your code:

```js
$.ajax.compat && $.ender({ ajax: $.ajax.compat });
```


**Happy Ajaxing!**
