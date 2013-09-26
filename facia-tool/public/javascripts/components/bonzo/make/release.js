var fs = require('fs')

fs.readFile('package.json', 'utf8', function (err, data) {
  var re = /\"version\": \"(\d+)\.(\d+)\.(\d+)\"/
  var m = data.match(re)
  var currentPatchVersion = parseInt(m[3], 10)
  var newFileData = data.replace(re, '"version": "$1.$2.' + (++currentPatchVersion) + '"');

  ['package.json', 'component.json'].forEach(function (file) {
    fs.writeFile(file, newFileData, 'utf8', function (err) {
      if (!err) console.log(file, 'saved successfully')
    })
  })
})
