const compile = require('../../../compile-css');

module.exports = {
    description: 'Compile Sass',
    task: [{
        description: 'Old IE',
        task: () => compile('old-ie.*.scss', {
            browsers: 'Explorer 8',
            remify: false,
        }),
    }, {
        description: 'IE9',
        task: () => compile('ie9.*.scss', {
            browsers: 'Explorer 9',
        }),
    }, {
        description: 'Modern',
        task: () => compile('!(_|ie9|old-ie)*.scss'),
    }, {
        description: 'Inline',
        task: () => compile('inline/*.scss'),
    }],
    concurrent: true,
};
