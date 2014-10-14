module.exports = function(grunt, options) {
    return {
        allFiles: [
            'static/src/stylesheets'
        ],
        options: {
            bundleExec: true,
            config: '.scss-lint.yml',
            reporterOutput: null
        }
    };
};
