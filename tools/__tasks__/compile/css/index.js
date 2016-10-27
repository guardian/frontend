module.exports = {
    description: 'Compile CSS',
    task: [
        {
            description: 'Prepare CSS',
            concurrent: true,
            task: [
                {
                    description: 'Generate CSS',
                    task: [
                        require('./clean'),
                        require('./mkdir'),
                        require('../images'),
                        require('./transpile-sass')
                    ]
                },
                require('./update-caniuse')
            ]
        },
        require('./atomise'),
        require('./remify'),
        require('./postcss')
    ]
};
