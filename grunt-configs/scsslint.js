module.exports = function(grunt, options) {
    return {
        allFiles: [
            'common/app/assets/stylesheets'
        ],
        options: {
            bundleExec: true,
            config: '.scss-lint.yml',
            reporterOutput: null
        }
    };
};
