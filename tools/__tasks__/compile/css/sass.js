const compile = require('../../../compile-css');
const postcss = require('../../../postcss');

module.exports = {
    description: 'Compile Sass',
    task: [
        {
            description: 'Old IE',
            task: () =>
                compile('old-ie.*.scss').then(result =>
                    postcss(result, {
                        browsers: 'Explorer 8',
                        remify: false,
                    })
                ),
        },
        {
            description: 'IE9',
            task: () =>
                compile('ie9.*.scss').then(result =>
                    postcss(result, {
                        browsers: 'Explorer 9',
                    })
                ),
        },
        {
            description: 'Email',
            task: () =>
                compile('head.email-{article,front}.scss').then(result =>
                    postcss(result, {
                        remify: false,
                    })
                ),
        },
        {
            description: 'Modern',
            task: () =>
                compile(
                    '!(_|ie9|old-ie|*email-article|*email-front)*.scss'
                ).then(result => postcss(result)),
        },
        {
            description: 'Inline',
            task: () =>
                compile('inline/*.scss').then(result => postcss(result)),
        },
        {
            description: 'Atoms',
            task: () => compile('atoms/*.scss').then(result => postcss(result)),
        },
    ],
    concurrent: true,
};
