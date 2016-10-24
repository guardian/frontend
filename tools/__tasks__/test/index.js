module.exports = {
    description: 'Test JS app',
    task: [
        'compile/inline-svgs/copy',
        {
            description: 'Run tests',
            task: [
                require('./javascript').common,
                require('./javascript').facia,
                require('./javascript').membership,
                require('./javascript').commercial,
                require('./javascript').eslint                
            ],
            concurrent: true
        }
    ]
};
