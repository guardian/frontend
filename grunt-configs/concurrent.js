module.exports = function (grunt, options) {
    var requireJSTargets = grunt.util._.chain(require('./requirejs')(grunt, options)).keys().without('options').map(function (key) {
        return 'requirejs:' + key;
    }).value();

    return {
        options: {
            limit: 24,
            logConcurrentOutput: true
        },
        sass: ['sass:old-ie', 'sass:ie9', 'sass:modern', 'sass:inline'],
        requireJS: requireJSTargets
    };
};
