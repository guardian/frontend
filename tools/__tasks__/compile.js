module.exports = {
    description: 'Compile assets for production',
    task: [
        'css/compile',
        'javascript/compile',
        'fonts/compile',
        'deploys-radiator/compile',
        'hash',
        'conf/compile'
    ]
};
