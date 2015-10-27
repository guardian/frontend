module.exports = function () {
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
