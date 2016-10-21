module.exports = {
    description: 'Compile assets for template rendering in Play',
    task: [
        'conf/copy',
        'inline-svgs/compile',
        'conf/minify'
    ]
};
