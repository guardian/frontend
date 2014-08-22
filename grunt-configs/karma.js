module.exports = function(grunt, options) {
    return {
        options: {
            reporters: options.isDev ? ['dots'] : ['progress'],
            singleRun: options.singleRun
        },
        common: {
            configFile: options.testConfDir + 'common.js'
        },
        facia: {
            configFile: options.testConfDir + 'facia.js'
        },
        membership: {
            configFile: options.testConfDir + 'membership.js'
        }
    };
};
