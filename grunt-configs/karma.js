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
        'project': {
            configFile: 'static/src/javascripts/test/conf/settings.js'
        }
    };
};
