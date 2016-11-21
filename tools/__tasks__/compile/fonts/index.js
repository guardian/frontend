module.exports = {
    description: 'Compile fonts',
    task: [
        require('./clean'),
        require('./mkdir'),
        require('./webfontjson')
    ]
};
