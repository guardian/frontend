module.exports = [{
    title: 'Compile fonts',
    task: [
        require('./mkdir'),
        require('./webfontjson')
    ]
}];
