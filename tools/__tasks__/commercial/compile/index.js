module.exports = {
    description: 'Compile Commercial JS Bundle',
    task: [
        require('../../compile/javascript/clean'),
        require('./webpack-commercial'),
    ],
};
