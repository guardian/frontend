
var crypto = require('crypto');

module.exports = function(source, encoding) {

  var md5sum = crypto.createHash('md5');

  md5sum.update(source, encoding );

  return md5sum.digest('hex');
};
