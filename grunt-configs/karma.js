module.exports = function(grunt, options) {
    return {
        options: {
            reporters: ['spec'],
            singleRun: options.singleRun,
            browserDisconnectTimeout: 10000,
            browserDisconnectTolerance: 3,
            browserNoActivityTimeout: 60000,
            reportSlowerThan: 1000,
            colors: !!options.isDev
        },
        'facia-tool': {
            configFile: 'facia-tool/test/public/conf/karma.conf.js'
        },
        'project': {
            configFile: 'static/src/javascripts/test/conf/settings.js'
        }
    };
};
