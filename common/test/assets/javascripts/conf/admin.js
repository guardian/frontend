module.exports = function(config) {
    var settings = new require('./settings-admin.js')(config);
    config.set(settings);
}