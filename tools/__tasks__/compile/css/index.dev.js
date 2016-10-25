module.exports = {
    description: 'Compile CSS',
    task: [
        'compile/css/clean',
        'compile/css/mkdir',
        'compile/images',
        'compile/css/transpile-sass',
        'compile/css/atomise',
        'compile/css/remify',
        'compile/css/postcss'
    ]
};
