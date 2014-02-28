var fs = require('fs')
  , version = require('../package.json').version;

['./reqwest.js', './reqwest.min.js'].forEach(function (file) {
  var data = fs.readFileSync(file, 'utf8')
  data = data.replace(/^\/\*\!/, '/*! version: ' + version)
  fs.writeFileSync(file, data)
})
