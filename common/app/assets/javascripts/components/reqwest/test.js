var spawn = require('child_process').spawn
  , server  = spawn('node', ['make/tests.js'])
  , phantom = spawn('./vendor/phantomjs', ['./phantom.js'])


phantom.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
})

phantom.on('exit', function (code, signal) {
  var outcome = code == 0 ? 'passed' : 'failed'
  console.log('Reqwest tests have %s', outcome, code)
  server.kill('SIGHUP')
  process.exit(code)
})
