module.exports = {
    description: 'Lint JS',
    task: [{
        description: 'Tests',
        task: [
            'grunt eslint:static/test/javascripts',
            'grunt shell:eslintTests'
        ],
        concurrent: true
    },{
        description: 'App',
        task: 'grunt eslint:static/src'
    }],
    concurrent: true
};
