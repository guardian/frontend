module.exports = {
    description: 'Compile CSS',
    task: [
        'css/clean',
        'css/mkdir',
        'images/compile',
        'css/transpile-sass',
        'css/atomise',
        'css/remify',
        'css/postcss'
    ]
};
