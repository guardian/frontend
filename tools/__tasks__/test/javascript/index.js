module.exports = {
    description: 'Test JS app',
    task: [
        require('../../compile/inline-svgs/copy'),
        {
            description: 'Run tests',
            task: [
                require('./commercial'),
                require('./common'),
                require('./facia'),
                require('./eslint')
            ],
            concurrent: true
        }
    ]
};
