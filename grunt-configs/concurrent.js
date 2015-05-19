module.exports = function(grunt, options) {

    return {
        options: {
            limit: 24,
            logConcurrentOutput: true
        },
        compile: ['compile:js:true', 'compile:css:true'],
        sass: ['sass:old-ie', 'sass:ie9', 'sass:modern']
    };
};
