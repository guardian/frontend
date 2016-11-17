module.exports = {
    description: 'Version assets',
    task: [
        require('./clean'),
        {
            description: 'Hash assets',
            task: 'grunt asset_hash'
        }
    ]
};
