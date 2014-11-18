module.exports = function(grunt, options) {
    return {
        options: {
            reporters: options.isDev ? ['dots'] : ['progress'],
            singleRun: options.singleRun,
            browserDisconnectTimeout: 10000,
            browserDisconnectTolerance: 3,
            browserNoActivityTimeout: 15000,
            reportSlowerThan: 1000
        },
        common: {
            configFile: options.testConfDir + 'common.js'
        },
        facia: {
            configFile: options.testConfDir + 'facia.js'
        },
        membership: {
            configFile: options.testConfDir + 'membership.js'
        },
        'facia-tool': {
            configFile: 'facia-tool/test/public/conf/karma.conf.js'
        }
    };
};
