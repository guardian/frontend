var smoosh = require('smoosh'),
    fs = require('fs');

smoosh.make('config/smoosh.json');

var copyright = fs.readFileSync('./src/copyright.js', 'utf8'),
    qwery = fs.readFileSync('./tmp/qwery.js', 'utf8'),
    qweryMin = fs.readFileSync('tmp/qwery.min.js', 'utf8');

fs.writeFileSync('./qwery.js', [copyright, qwery].join(''), 'utf8');
fs.writeFileSync('./qwery.min.js', [copyright, qweryMin].join(''), 'utf8');