module.exports = {
    description: 'Compile CSS',
    task: [
        require('./clean'),
        require('./mkdir'),
        require('../images'),
        require('./update-caniuse'),
        require('./sass'),
        require('./atomise')
    ]
};
