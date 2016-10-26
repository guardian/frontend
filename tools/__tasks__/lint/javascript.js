module.exports = {
    description: 'Lint JS',
    task: [{
        description: 'Lint tests',
        task: 'grunt eslint:static/test/javascripts'
    },{
        description: 'Lint app JS',
        task: 'grunt eslint:static/src'
    }],
    concurrent: true
};
