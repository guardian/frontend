const {target} = require('../config').paths;

module.exports = [{
    title: 'Compile CSS',
    task: [
        require('./clean'),
        require('./mkdir'),
        require('../images/compile'),
        require('./transpile-sass'),
        require('./atomise'),
        require('./remify'),
        require('./postcss')
    ]
}];
