module.exports = function(grunt, options) {
    var requireJSTargets = grunt.util._.chain(require('./requirejs')(grunt, options)).keys().without('options').map(function(key){
        return 'requirejs:' + key;
    }).value();

    return {
        options: {
            logConcurrentOutput: true
        },
        compile: ['compile:js:true', 'compile:css:true'],
        sass: ['sass:old-ie', 'sass:ie9', 'sass:modern'],
        requireJS: requireJSTargets
    };
};
