module.exports = function(grunt, options) {
    return {
        options: {
            logConcurrentOutput: true
        },
        compile: ['compile:js', 'compile:css']
    }
}
