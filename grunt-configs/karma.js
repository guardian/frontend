module.exports = function (grunt, options) {
    return {
        options: {
            singleRun: options.singleRun,
            colors: !!options.isDev
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
        commercial: {
            configFile: options.testConfDir + 'commercial.js'
        }
    };
};
