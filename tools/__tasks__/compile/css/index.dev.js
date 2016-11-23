module.exports = {
    description: 'Compile CSS',
    task: [
        require('./clean'),
        require('./mkdir'),
        require('../images'),
        require('./transpile-sass'),
        require('./atomise')
    ]
};
