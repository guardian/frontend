module.exports = function(grunt, options) {
    return {
        options: {
            logConcurrentOutput: true
        },
        compile: ['compile:js:true', 'compile:css:true'],
        sass: ['sass:old-ie', 'sass:ie9', 'sass:modern']
    };
};
