// node_modules/serve/bin/serve .
// node_modules/phantomjs/bin/phantomjs tests/phantom.js


var childProcess = require('child_process')
var phantomjs = require('phantomjs')
var path = require('path')
var binPath = phantomjs.path

var childArgs = [
  path.join(__dirname, 'phantom.js')
]

var server = childProcess.spawn('node_modules/serve/bin/serve', ['.'])

var phantomServer = childProcess.spawn(binPath, childArgs)

phantomServer.on('exit', function (code) {
  if (code === 0) {
    console.log('all tests pass. congratulations')
  } else {
    console.log('tests fail')
  }
  server.kill()
})
