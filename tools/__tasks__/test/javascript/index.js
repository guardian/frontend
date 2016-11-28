module.exports = {
    description: 'Test JS app',
    task: [
        require('../../compile/inline-svgs'),
        {
            description: 'Run tests',
            task: [
                'commercial',
                'common',
                'facia'
            ].map(set => ({
                description: `Run ${set} tests`,
                task: `karma start ./static/test/javascripts/conf/${set}.js --single-run`
            })).concat([require('./eslint')]),
            concurrent: true
        }
    ]
};
