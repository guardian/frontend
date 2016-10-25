module.exports = {
    description: 'Compile assets for production',
    task: [
        'compile/css',
        'compile/javascript',
        'compile/fonts',
        'compile/deploys-radiator',
        'compile/hash',
        'compile/conf'
    ]
};
