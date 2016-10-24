module.exports = {
    description: 'Lint JS',
    task: [{
        description: 'Tests',
        task: 'grunt eslint:static/test/javascripts'
    },{
        description: 'App',
        task: 'grunt eslint:static/src'
    }],
    concurrent: true
};
