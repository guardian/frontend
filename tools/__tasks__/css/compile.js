module.exports = {
    description: 'Compile CSS',
    task: [
        'css/clean',
        'css/mkdir',
        'images/compile',
        'css/transpile-sass',
        'css/update-caniuse',
        'css/atomise',
        'css/remify',
        'css/postcss'
    ]
};
