var exec = require('child_process').exec
  , fs = require('fs')
  , Connect = require('connect')
  , dispatch = require('dispatch')
  , mime = require('mime')
  , DelayedStream = require('delayed-stream')

  , getMime = function(ext) {
      return mime.lookup(ext == 'jsonp' ? 'js' : ext)
    }

var routes = {
  '/': function (req, res) {
    res.write(fs.readFileSync('./tests/tests.html', 'utf8'))
    res.end()
  },
  '/tests/timeout$': function (req, res) {
      var delayed = DelayedStream.create(req)
      setTimeout(function() {
        res.writeHead(200, {
            'Expires': 0
          , 'Cache-Control': 'max-age=0, no-cache, no-store'
        })
        req.query.callback && res.write(req.query.callback + '(')
        res.write(JSON.stringify({ method: req.method, query: req.query, headers: req.headers }))
        req.query.callback && res.write(');')
        delayed.pipe(res)
      }, 2000)
  },
  '(([\\w\\-\\/\\.]+)\\.(css|js|json|jsonp|html|xml)$)': function (req, res, next, uri, file, ext) {
    res.writeHead(200, {
        'Expires': 0
      , 'Cache-Control': 'max-age=0, no-cache, no-store'
      , 'Content-Type': getMime(ext)
    })
    if (req.query.echo !== undefined) {
      ext == 'jsonp' && res.write((req.query.callback || req.query.testCallback || 'echoCallback') + '(')
      res.write(JSON.stringify({ method: req.method, query: req.query, headers: req.headers }))
      ext == 'jsonp' && res.write(');')
    } else {
      res.write(fs.readFileSync('./' + file + '.' + ext))
    }
    res.end()
  }
}

Connect.createServer(Connect.query(), dispatch(routes)).listen(1234)

var otherOriginRoutes = {
    '/get-value': function (req, res) {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': req.headers.origin,
        'Content-Type': 'text/plain'
      })
      res.end('hello')
    },
    '/set-cookie': function (req, res) {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': req.headers.origin,
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'text/plain',
        'Set-Cookie': 'cookie=hello'
      })
      res.end('Set a cookie!')
    },
    '/get-cookie-value': function (req, res) {
      var cookies = {}
        , value

      req.headers.cookie && req.headers.cookie.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=')
        cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim()
      })
      value = cookies.cookie

      res.writeHead(200, {
          'Access-Control-Allow-Origin': req.headers.origin,
          'Access-Control-Allow-Credentials': 'true',
          'Content-Type': 'text/plain'
      })
      res.end(value)
    }
}

Connect.createServer(Connect.query(), dispatch(otherOriginRoutes)).listen(5678)

exec('open http://localhost:1234', function () {
  console.log('opening tests at http://localhost:1234')
})