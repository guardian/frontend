module.exports = {
    description: 'Compile CSS',
    task: [
        require('./clean'),
        require('./mkdir'),
        require('../images'),
        require('./transpile-sass'),
        require('./update-caniuse'),
        require('./atomise'),
        require('./remify'),
        require('./postcss')
    ]
};
