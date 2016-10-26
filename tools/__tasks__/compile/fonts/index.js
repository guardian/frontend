module.exports = {
    description: 'Compile fonts',
    task: [
        require('./mkdir'),
        require('./webfontjson')
    ]
};
