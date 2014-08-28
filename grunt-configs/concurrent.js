module.exports = function(grunt, options) {
    return {
        options: {
            logConcurrentOutput: true
        },
        compile: ['compile:js', 'compile:css'],
        sass: ['sass:old-ie', 'sass:ie9', 'sass:modern']
    };
};
