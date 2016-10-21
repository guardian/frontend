module.exports = {
    description: 'Compile JS',
    task: [
        'javascript/clean',
        'inline-svgs/compile',
        'javascript/copy',
        'javascript/bundle',
        'javascript/bundle-standard',
        'javascript/bundle-shims',
        'javascript/minify'
    ]
};
