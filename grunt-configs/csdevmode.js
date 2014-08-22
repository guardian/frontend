module.exports = function(grunt, options) {
    return {
        options: {
            srcBasePath: 'common/app/assets/stylesheets/',
            destBasePath: options.staticHashDir + '/stylesheets'
        },
        main: {
            assets: ['global', 'head.default', 'head.facia', 'head.football']
        }
    };
};
