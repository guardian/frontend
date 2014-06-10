var Promise = require('../promiscuous');
module.exports = {
  resolved: Promise.resolve,
  rejected: Promise.reject,
  deferred: function () {
    var deferred = {};
    deferred.promise = new Promise(function (resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
  },
};
