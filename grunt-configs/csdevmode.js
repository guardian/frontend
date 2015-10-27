module.exports = function (grunt, options) {
    return {
        options: {
            srcBasePath: 'static/src/stylesheets/',
            destBasePath: options.staticHashDir + '/stylesheets'
        },
        main: {
            assets: ['global', 'head.content', 'head.facia', 'head.football', 'head.story-package']
        }
    };
};
